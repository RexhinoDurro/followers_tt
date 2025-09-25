# api/views/paypal_billing_views.py - Updated with proper subscription flow
import logging
import json
from decimal import Decimal
from datetime import datetime
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import requests
import dateutil.parser
from ..models import Client

logger = logging.getLogger(__name__)

# PayPal Plan Configuration - UPDATED with English translations
PAYPAL_PLANS = {
    'starter': {
        'id': 'starter',
        'name': 'Starter Plan',
        'price': 100,  # $100/month (100€ converted)
        'paypal_plan_id': getattr(settings, 'PAYPAL_STARTER_PLAN_ID', ''),
        'features': [
            '12 posts (photos/reels)',
            '12 interactive stories', 
            'Organic growth and hashtag research',
            'Monthly growth reports and statistics',
            'Ideal for small businesses'
        ]
    },
    'pro': {
        'id': 'pro', 
        'name': 'Pro Plan',
        'price': 250,  # $250/month (250€ converted)
        'paypal_plan_id': getattr(settings, 'PAYPAL_PRO_PLAN_ID', ''),
        'features': [
            '20 posts + reels',
            'Advanced promotional campaigns',
            'Growth strategy and blog optimization',
            'Enhanced reports and recommendations',
            'Aggressive growth strategies'
        ]
    },
    'premium': {
        'id': 'premium',
        'name': 'Premium Plan', 
        'price': 400,  # $400/month (400€ converted)
        'paypal_plan_id': getattr(settings, 'PAYPAL_PREMIUM_PLAN_ID', ''),
        'features': [
            'Instagram + Facebook + TikTok',
            '30+ posts (design, reels, carousel)',
            'Premium advertising with budget allocation',
            'Professional management and plotting',
            'Full-service social media management'
        ]
    }
}

class PayPalAPIClient:
    """PayPal API client for handling authentication and requests"""
    
    def __init__(self):
        self.client_id = getattr(settings, 'PAYPAL_CLIENT_ID', '')
        self.client_secret = getattr(settings, 'PAYPAL_CLIENT_SECRET', '')
        self.base_url = getattr(settings, 'PAYPAL_BASE_URL', 'https://api-m.sandbox.paypal.com')
        self._access_token = None
    
    def get_access_token(self):
        """Get PayPal access token"""
        if self._access_token:
            return self._access_token
            
        url = f"{self.base_url}/v1/oauth2/token"
        headers = {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
        }
        data = 'grant_type=client_credentials'
        
        try:
            response = requests.post(
                url,
                headers=headers,
                data=data,
                auth=(self.client_id, self.client_secret)
            )
            response.raise_for_status()
            token_data = response.json()
            self._access_token = token_data['access_token']
            return self._access_token
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get PayPal access token: {e}")
            raise
    
    def make_request(self, method, endpoint, data=None):
        """Make authenticated request to PayPal API"""
        token = self.get_access_token()
        url = f"{self.base_url}{endpoint}"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}',
        }
        
        try:
            response = requests.request(method, url, headers=headers, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"PayPal API request failed: {e}")
            if hasattr(e.response, 'text'):
                logger.error(f"Response: {e.response.text}")
            raise

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_plans(request):
    """Get available subscription plans"""
    try:
        plans = []
        for plan_id, plan_data in PAYPAL_PLANS.items():
            plans.append({
                'id': plan_data['id'],
                'name': plan_data['name'],
                'price': plan_data['price'],
                'features': plan_data['features'],
                'recommended': plan_id == 'pro'  # Mark Pro as recommended
            })
        
        return Response({
            'plans': plans,
            'currency': 'USD',
            'billing_cycle': 'monthly'
        })
    except Exception as e:
        logger.error(f"Error getting available plans: {e}")
        return Response(
            {'error': 'Failed to retrieve plans'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_subscription(request):
    """Get current subscription details for the authenticated user"""
    try:
        # Get the client profile for the current user
        try:
            client = Client.objects.get(user=request.user)
        except Client.DoesNotExist:
            return Response({
                'plan': 'none',
                'planId': 'none',
                'price': 0,
                'billing_cycle': 'monthly',
                'next_billing_date': None,
                'features': [],
                'status': 'none',
                'subscriptionId': None,
                'can_cancel': False,
                'cancel_at_period_end': False,
                'payment_method': 'paypal',
                'auto_renewal': False,
                'message': 'No client profile found'
            })
        
        # If no current plan or plan is 'none', return basic info
        if not client.current_plan or client.current_plan == 'none':
            return Response({
                'plan': 'none',
                'planId': 'none',
                'price': 0,
                'billing_cycle': 'monthly',
                'next_billing_date': None,
                'features': [],
                'status': 'none',
                'subscriptionId': None,
                'can_cancel': False,
                'cancel_at_period_end': False,
                'payment_method': 'paypal',
                'auto_renewal': False
            })
        
        # Get plan details
        plan_details = PAYPAL_PLANS.get(client.current_plan, {})
        
        # If no PayPal subscription ID, return local data
        if not client.paypal_subscription_id:
            return Response({
                'plan': client.current_plan,
                'planId': client.current_plan,
                'price': float(client.monthly_fee) if client.monthly_fee else plan_details.get('price', 0),
                'billing_cycle': 'monthly',
                'next_billing_date': client.next_payment.isoformat() if client.next_payment else None,
                'features': plan_details.get('features', []),
                'status': 'inactive',
                'subscriptionId': None,
                'can_cancel': False,
                'cancel_at_period_end': False,
                'payment_method': 'paypal',
                'auto_renewal': False
            })
        
        # Fetch current subscription details from PayPal
        paypal_client = PayPalAPIClient()
        
        try:
            subscription = paypal_client.make_request(
                'GET', 
                f'/v1/billing/subscriptions/{client.paypal_subscription_id}'
            )
            
            # Extract billing info
            billing_info = subscription.get('billing_info', {})
            next_billing_time = billing_info.get('next_billing_time')
            
            subscription_data = {
                'plan': client.current_plan,
                'planId': client.current_plan,
                'price': float(client.monthly_fee) if client.monthly_fee else plan_details.get('price', 0),
                'billing_cycle': 'monthly',
                'next_billing_date': next_billing_time,
                'features': plan_details.get('features', []),
                'status': 'active' if subscription.get('status') == 'ACTIVE' else subscription.get('status', '').lower(),
                'subscriptionId': subscription.get('id'),
                'can_cancel': subscription.get('status') == 'ACTIVE',
                'cancel_at_period_end': False,
                'payment_method': 'paypal',
                'auto_renewal': subscription.get('status') == 'ACTIVE',
                'subscriber_info': {
                    'name': subscription.get('subscriber', {}).get('name', {}),
                    'email': subscription.get('subscriber', {}).get('email_address')
                },
                'paypal_details': {
                    'plan_id': subscription.get('plan_id'),
                    'create_time': subscription.get('create_time'),
                    'update_time': subscription.get('update_time'),
                    'status_update_time': subscription.get('status_update_time')
                }
            }
            
            return Response(subscription_data)
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch subscription from PayPal: {e}")
            # Return local data if PayPal API fails
            return Response({
                'plan': client.current_plan,
                'planId': client.current_plan,
                'price': float(client.monthly_fee) if client.monthly_fee else plan_details.get('price', 0),
                'billing_cycle': 'monthly',
                'next_billing_date': client.next_payment.isoformat() if client.next_payment else None,
                'features': plan_details.get('features', []),
                'status': 'unknown',
                'subscriptionId': client.paypal_subscription_id,
                'can_cancel': True,
                'cancel_at_period_end': False,
                'payment_method': 'paypal',
                'auto_renewal': False,
                'error': 'Could not fetch latest status from PayPal'
            })
            
    except Exception as e:
        logger.error(f"Error getting current subscription: {e}")
        return Response(
            {'error': 'Failed to retrieve subscription details'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_subscription(request):
    """Approve and activate a PayPal subscription"""
    try:
        subscription_id = request.data.get('subscription_id')
        
        if not subscription_id:
            return Response(
                {'error': 'Subscription ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        paypal_client = PayPalAPIClient()
        
        # Get subscription details
        subscription = paypal_client.make_request('GET', f'/v1/billing/subscriptions/{subscription_id}')
        
        if subscription.get('status') == 'ACTIVE':
            # Update user's subscription in database
            try:
                client = Client.objects.get(user=request.user)
                
                # Find the plan based on PayPal plan ID
                plan_id = subscription.get('plan_id', '')
                current_plan = None
                monthly_fee = 0
                
                for plan_key, plan_data in PAYPAL_PLANS.items():
                    if plan_data['paypal_plan_id'] == plan_id:
                        current_plan = plan_key
                        monthly_fee = plan_data['price']
                        break
                
                # Update client subscription details
                client.paypal_subscription_id = subscription_id
                client.current_plan = current_plan or 'starter'  # Default to starter if not found
                client.monthly_fee = monthly_fee
                client.status = 'active'
                client.payment_status = 'paid'
                client.subscription_start_date = timezone.now()
                client.package = PAYPAL_PLANS.get(current_plan, {}).get('name', 'Unknown Plan')
                
                # Get subscriber info
                subscriber = subscription.get('subscriber', {})
                if subscriber.get('payer_id'):
                    client.paypal_customer_id = subscriber['payer_id']
                
                # Set next payment date based on billing info
                billing_info = subscription.get('billing_info', {})
                if billing_info.get('next_billing_time'):
                    client.next_payment = dateutil.parser.parse(
                        billing_info['next_billing_time']
                    ).date()
                else:
                    # Default to 1 month from now
                    from datetime import timedelta
                    client.next_payment = timezone.now().date() + timedelta(days=30)
                
                client.save()
                
                logger.info(f"Subscription {subscription_id} activated for user {request.user.id}")
                
            except Client.DoesNotExist:
                logger.error(f"Client profile not found for user {request.user.id}")
                return Response(
                    {'error': 'Client profile not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                logger.error(f"Error updating client subscription: {e}")
            
            return Response({
                'success': True,
                'subscription_id': subscription_id,
                'status': 'ACTIVE',
                'message': 'Subscription activated successfully',
                'plan': current_plan,
                'monthly_fee': monthly_fee
            })
        else:
            return Response(
                {'error': f'Subscription is not active. Status: {subscription.get("status")}'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        logger.error(f"Error approving subscription: {e}")
        return Response(
            {'error': 'Failed to approve subscription'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subscription(request):
    """Create a PayPal subscription"""
    try:
        plan_name = request.data.get('plan_name')
        price_id = request.data.get('price_id', '').replace('price_', '').replace('_monthly', '')
        
        # Find the plan
        plan_data = None
        for plan_id, plan in PAYPAL_PLANS.items():
            if plan_id == price_id or plan['name'] == plan_name:
                plan_data = plan
                break
        
        if not plan_data:
            return Response(
                {'error': 'Invalid plan selected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not plan_data.get('paypal_plan_id'):
            return Response(
                {'error': f'PayPal plan ID not configured for {plan_data["name"]}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        paypal_client = PayPalAPIClient()
        
        # Create subscription
        subscription_data = {
            "plan_id": plan_data['paypal_plan_id'],
            "subscriber": {
                "name": {
                    "given_name": request.user.first_name or "Customer",
                    "surname": request.user.last_name or "User"
                },
                "email_address": request.user.email
            },
            "application_context": {
                "brand_name": "VisionBoost Agency",
                "locale": "en-US",
                "shipping_preference": "NO_SHIPPING",
                "user_action": "SUBSCRIBE_NOW",
                "payment_method": {
                    "payer_selected": "PAYPAL",
                    "payee_preferred": "IMMEDIATE_PAYMENT_REQUIRED"
                },
                "return_url": f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/billing/success",
                "cancel_url": f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/billing/cancel"
            }
        }
        
        subscription = paypal_client.make_request('POST', '/v1/billing/subscriptions', subscription_data)
        
        # Find approval URL
        approval_url = None
        for link in subscription.get('links', []):
            if link.get('rel') == 'approve':
                approval_url = link.get('href')
                break
        
        if not approval_url:
            raise Exception("No approval URL found in PayPal response")
        
        logger.info(f"Created PayPal subscription {subscription['id']} for user {request.user.id}")
        
        return Response({
            'subscription_id': subscription['id'],
            'approval_url': approval_url,
            'status': subscription.get('status', 'APPROVAL_PENDING'),
            'plan_name': plan_data['name'],
            'amount': plan_data['price']
        })
        
    except Exception as e:
        logger.error(f"Error creating subscription: {e}")
        return Response(
            {'error': 'Failed to create subscription'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    """Cancel the current PayPal subscription"""
    try:
        # Get the client profile
        try:
            client = Client.objects.get(user=request.user)
        except Client.DoesNotExist:
            return Response(
                {'error': 'No client profile found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not client.paypal_subscription_id:
            return Response(
                {'error': 'No active subscription found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        paypal_client = PayPalAPIClient()
        reason = request.data.get('reason', 'Customer requested cancellation')
        
        # Cancel subscription in PayPal
        cancel_data = {
            "reason": reason
        }
        
        response = paypal_client.make_request(
            'POST', 
            f'/v1/billing/subscriptions/{client.paypal_subscription_id}/cancel',
            cancel_data
        )
        
        # Update local client record
        client.status = 'cancelled'
        client.payment_status = 'none'
        client.subscription_end_date = timezone.now()
        client.save()
        
        logger.info(f"Subscription {client.paypal_subscription_id} cancelled for user {request.user.id}")
        
        return Response({
            'success': True,
            'message': 'Subscription cancelled successfully',
            'cancelled_at': timezone.now(),
            'reason': reason,
            'cancelled_immediately': True
        })
        
    except Exception as e:
        logger.error(f"Error cancelling subscription: {e}")
        return Response(
            {'error': 'Failed to cancel subscription'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """Create a one-time PayPal order"""
    try:
        amount = request.data.get('amount')
        description = request.data.get('description', 'Service Payment')
        invoice_id = request.data.get('invoice_id')
        
        if not amount:
            return Response(
                {'error': 'Amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        paypal_client = PayPalAPIClient()
        
        order_data = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "amount": {
                    "currency_code": "USD",
                    "value": str(amount)
                },
                "description": description
            }],
            "application_context": {
                "brand_name": "VisionBoost Agency",
                "locale": "en-US",
                "landing_page": "BILLING",
                "shipping_preference": "NO_SHIPPING",
                "user_action": "PAY_NOW",
                "return_url": f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/payment/success",
                "cancel_url": f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/payment/cancel"
            }
        }
        
        # Add invoice reference if provided
        if invoice_id:
            order_data["purchase_units"][0]["invoice_id"] = str(invoice_id)
        
        order = paypal_client.make_request('POST', '/v2/checkout/orders', order_data)
        
        # Find approval URL
        approval_url = None
        for link in order.get('links', []):
            if link.get('rel') == 'approve':
                approval_url = link.get('href')
                break
        
        if not approval_url:
            raise Exception("No approval URL found in PayPal response")
        
        logger.info(f"Created PayPal order {order['id']} for user {request.user.id}")
        
        return Response({
            'order_id': order['id'],
            'approval_url': approval_url,
            'status': order.get('status', 'CREATED'),
            'amount': amount,
            'description': description,
            'invoice_number': invoice_id
        })
        
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        return Response(
            {'error': 'Failed to create order'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def capture_payment(request):
    """Capture a PayPal payment"""
    try:
        order_id = request.data.get('order_id')
        
        if not order_id:
            return Response(
                {'error': 'Order ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        paypal_client = PayPalAPIClient()
        
        # Capture the payment
        capture = paypal_client.make_request('POST', f'/v2/checkout/orders/{order_id}/capture')
        
        if capture.get('status') == 'COMPLETED':
            # Update invoice status if this was for an invoice
            purchase_units = capture.get('purchase_units', [])
            if purchase_units:
                invoice_id = purchase_units[0].get('invoice_id')
                if invoice_id:
                    try:
                        from ..models import Invoice
                        invoice = Invoice.objects.get(id=invoice_id)
                        invoice.status = 'paid'
                        invoice.paid_at = timezone.now()
                        invoice.save()
                        
                        # Update client's total spent
                        invoice.client.total_spent += invoice.amount
                        invoice.client.payment_status = 'paid'
                        invoice.client.save()
                        
                        logger.info(f"Invoice {invoice_id} marked as paid via PayPal order {order_id}")
                    except Exception as e:
                        logger.error(f"Error updating invoice {invoice_id}: {e}")
            
            logger.info(f"Payment captured for order {order_id}, user {request.user.id}")
            
            return Response({
                'success': True,
                'order_id': order_id,
                'status': 'COMPLETED',
                'message': 'Payment captured successfully'
            })
        else:
            return Response(
                {'error': f'Payment capture failed. Status: {capture.get("status")}'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        logger.error(f"Error capturing payment: {e}")
        return Response(
            {'error': 'Failed to capture payment'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@method_decorator(csrf_exempt, name='dispatch')
@api_view(['POST'])
def paypal_webhook(request):
    """Handle PayPal webhooks"""
    try:
        webhook_data = json.loads(request.body)
        event_type = webhook_data.get('event_type')
        
        logger.info(f"Received PayPal webhook: {event_type}")
        
        if event_type == 'BILLING.SUBSCRIPTION.ACTIVATED':
            # Handle subscription activation
            subscription = webhook_data.get('resource', {})
            subscription_id = subscription.get('id')
            
            try:
                client = Client.objects.get(paypal_subscription_id=subscription_id)
                client.status = 'active'
                client.payment_status = 'paid'
                
                if not client.subscription_start_date:
                    client.subscription_start_date = timezone.now()
                
                client.save()
                logger.info(f"Subscription {subscription_id} activated via webhook for client {client.id}")
            except Client.DoesNotExist:
                logger.warning(f"Client not found for subscription {subscription_id}")
            
        elif event_type == 'BILLING.SUBSCRIPTION.CANCELLED':
            subscription = webhook_data.get('resource', {})
            subscription_id = subscription.get('id')
            
            try:
                client = Client.objects.get(paypal_subscription_id=subscription_id)
                client.status = 'cancelled'
                client.payment_status = 'none'
                client.subscription_end_date = timezone.now()
                client.save()
                logger.info(f"Subscription {subscription_id} cancelled via webhook for client {client.id}")
            except Client.DoesNotExist:
                logger.warning(f"Client not found for subscription {subscription_id}")
        
        elif event_type == 'PAYMENT.SALE.COMPLETED':
            sale = webhook_data.get('resource', {})
            billing_agreement_id = sale.get('billing_agreement_id')
            
            if billing_agreement_id:
                try:
                    client = Client.objects.get(paypal_subscription_id=billing_agreement_id)
                    client.payment_status = 'paid'
                    client.total_spent += Decimal(sale.get('amount', {}).get('total', 0))
                    
                    # Update next payment date
                    from dateutil.relativedelta import relativedelta
                    if client.next_payment:
                        client.next_payment = client.next_payment + relativedelta(months=1)
                    
                    client.save()
                    logger.info(f"Payment completed via webhook for client {client.id}")
                except Client.DoesNotExist:
                    logger.warning(f"Client not found for billing agreement {billing_agreement_id}")
        
        return JsonResponse({'status': 'success'})
        
    except Exception as e:
        logger.error(f"Error processing PayPal webhook: {e}")
        return JsonResponse({'error': 'Webhook processing failed'}, status=500)

# ============ STUB FUNCTIONS FOR FRONTEND COMPATIBILITY ============

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_invoice_stub(request, invoice_id):
    """Stub for paying invoices - redirects to PayPal one-time payment"""
    try:
        from ..models import Invoice
        try:
            invoice = Invoice.objects.get(id=invoice_id, client__user=request.user)
        except Invoice.DoesNotExist:
            return Response(
                {'error': 'Invoice not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Use the create_order endpoint
        order_data = {
            'amount': float(invoice.amount),
            'description': f"Invoice #{invoice.invoice_number}",
            'invoice_id': str(invoice.id)
        }
        
        # Call create_order internally
        from django.test import RequestFactory
        factory = RequestFactory()
        order_request = factory.post('/api/billing/create-order/', order_data)
        order_request.user = request.user
        
        response = create_order(order_request)
        return response
        
    except Exception as e:
        logger.error(f"Error creating invoice payment: {e}")
        return Response(
            {'error': 'Failed to create payment for invoice'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_methods_stub(request):
    """Stub for payment methods - PayPal doesn't support saved payment methods"""
    return Response({
        'payment_methods': [],
        'message': 'PayPal does not support saved payment methods. Payments are processed directly through PayPal.',
        'provider': 'paypal'
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_setup_intent_stub(request):
    """Stub for setup intent - PayPal doesn't support this"""
    return Response({
        'error': 'PayPal does not support setup intents. Use direct payment or subscription flows.',
        'provider': 'paypal'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_default_payment_method_stub(request, payment_method_id):
    """Stub for setting default payment method - PayPal doesn't support this"""
    return Response({
        'error': 'PayPal does not support default payment methods. Each payment is processed individually.',
        'provider': 'paypal'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_payment_method_stub(request, payment_method_id):
    """Stub for deleting payment method - PayPal doesn't support this"""
    return Response({
        'error': 'PayPal does not support saved payment methods to delete.',
        'provider': 'paypal'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_billing_settings_stub(request):
    """Stub for admin billing settings"""
    if not request.user.is_staff and request.user.role != 'admin':
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    return Response({
        'provider': 'paypal',
        'settings': {
            'paypal_client_id': getattr(settings, 'PAYPAL_CLIENT_ID', ''),
            'paypal_environment': 'sandbox' if 'sandbox' in getattr(settings, 'PAYPAL_BASE_URL', '') else 'live',
            'webhook_url': f"{getattr(settings, 'BACKEND_URL', 'http://localhost:8000')}/api/billing/webhook/",
            'plans_configured': len(PAYPAL_PLANS),
            'available_plans': list(PAYPAL_PLANS.keys())
        }
    })

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_admin_account_stub(request):
    """Stub for deleting admin account"""
    if not request.user.is_staff and request.user.role != 'admin':
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    return Response({
        'error': 'Account deletion must be performed manually for security reasons.',
        'message': 'Please contact system administrator for account deletion.'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_subscription_plan(request):
    """Update/upgrade the current subscription plan"""
    return Response({
        'error': 'Plan updates not yet implemented. Please cancel current subscription and create a new one.',
        'message': 'This feature will be available in a future update.'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)