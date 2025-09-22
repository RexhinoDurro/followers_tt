# api/views/paypal_billing_views.py
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

# PayPal Plan Configuration
PAYPAL_PLANS = {
    'starter': {
        'id': 'starter',
        'name': 'Starter Plan',
        'price': 100,
        'paypal_plan_id': settings.PAYPAL_STARTER_PLAN_ID,
        'features': [
            'Instagram Growth Management',
            'Basic Analytics Dashboard',
            'Monthly Performance Reports',
            'Email Support',
            'Up to 2 Social Accounts'
        ]
    },
    'pro': {
        'id': 'pro',
        'name': 'Pro Plan',
        'price': 250,
        'paypal_plan_id': settings.PAYPAL_PRO_PLAN_ID,
        'features': [
            'Multi-Platform Management',
            'Advanced Analytics',
            'Weekly Performance Reports',
            'Priority Support',
            'Up to 5 Social Accounts',
            'Custom Content Strategies'
        ]
    },
    'premium': {
        'id': 'premium',
        'name': 'Premium Plan',
        'price': 400,
        'paypal_plan_id': settings.PAYPAL_PREMIUM_PLAN_ID,
        'features': [
            'Full-Service Management',
            'Real-time Analytics',
            'Daily Performance Reports',
            '24/7 Dedicated Support',
            'Unlimited Social Accounts',
            'Custom Content Creation',
            'Influencer Outreach'
        ]
    }
}

class PayPalAPIClient:
    """PayPal API client for handling authentication and requests"""
    
    def __init__(self):
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.client_secret = settings.PAYPAL_CLIENT_SECRET
        self.base_url = settings.PAYPAL_BASE_URL
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
                "brand_name": "VisionBoost",
                "locale": "en-US",
                "shipping_preference": "NO_SHIPPING",
                "user_action": "SUBSCRIBE_NOW",
                "payment_method": {
                    "payer_selected": "PAYPAL",
                    "payee_preferred": "IMMEDIATE_PAYMENT_REQUIRED"
                },
                "return_url": f"{settings.FRONTEND_URL}/billing/success",
                "cancel_url": f"{settings.FRONTEND_URL}/billing/cancel"
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
                client.current_plan = current_plan
                client.monthly_fee = monthly_fee
                client.status = 'active'
                client.payment_status = 'paid'
                client.subscription_start_date = timezone.now()
                
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
                
                client.save()
                
            except Client.DoesNotExist:
                logger.error(f"Client profile not found for user {request.user.id}")
            except Exception as e:
                logger.error(f"Error updating client subscription: {e}")
            
            logger.info(f"Subscription {subscription_id} activated for user {request.user.id}")
            
            return Response({
                'success': True,
                'subscription_id': subscription_id,
                'status': 'ACTIVE',
                'message': 'Subscription activated successfully'
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
def create_order(request):
    """Create a one-time PayPal order"""
    try:
        amount = request.data.get('amount')
        description = request.data.get('description', 'Service Payment')
        
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
                "brand_name": "VisionBoost",
                "locale": "en-US",
                "landing_page": "BILLING",
                "shipping_preference": "NO_SHIPPING",
                "user_action": "PAY_NOW",
                "return_url": f"{settings.FRONTEND_URL}/payment/success",
                "cancel_url": f"{settings.FRONTEND_URL}/payment/cancel"
            }
        }
        
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
            'description': description
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
            # TODO: Update payment record in database
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
        # TODO: Verify webhook signature for security
        webhook_data = json.loads(request.body)
        event_type = webhook_data.get('event_type')
        
        logger.info(f"Received PayPal webhook: {event_type}")
        
        if event_type == 'BILLING.SUBSCRIPTION.ACTIVATED':
            # Handle subscription activation
            subscription = webhook_data.get('resource', {})
            subscription_id = subscription.get('id')
            
            # Find client by subscription ID and update status
            try:
                client = Client.objects.get(paypal_subscription_id=subscription_id)
                client.status = 'active'
                client.payment_status = 'paid'
                
                # Update subscription start date if not set
                if not client.subscription_start_date:
                    client.subscription_start_date = timezone.now()
                
                client.save()
                logger.info(f"Subscription {subscription_id} activated via webhook for client {client.id}")
            except Client.DoesNotExist:
                logger.warning(f"Client not found for subscription {subscription_id}")
            
        elif event_type == 'BILLING.SUBSCRIPTION.CANCELLED':
            # Handle subscription cancellation
            subscription = webhook_data.get('resource', {})
            subscription_id = subscription.get('id')
            
            try:
                client = Client.objects.get(paypal_subscription_id=subscription_id)
                client.status = 'paused'
                client.payment_status = 'overdue'
                client.subscription_end_date = timezone.now()
                client.save()
                logger.info(f"Subscription {subscription_id} cancelled via webhook for client {client.id}")
            except Client.DoesNotExist:
                logger.warning(f"Client not found for subscription {subscription_id}")
            
        elif event_type == 'BILLING.SUBSCRIPTION.SUSPENDED':
            # Handle subscription suspension
            subscription = webhook_data.get('resource', {})
            subscription_id = subscription.get('id')
            
            try:
                client = Client.objects.get(paypal_subscription_id=subscription_id)
                client.status = 'paused'
                client.payment_status = 'overdue'
                client.save()
                logger.info(f"Subscription {subscription_id} suspended via webhook for client {client.id}")
            except Client.DoesNotExist:
                logger.warning(f"Client not found for subscription {subscription_id}")
                
        elif event_type == 'PAYMENT.SALE.COMPLETED':
            # Handle successful subscription payment
            sale = webhook_data.get('resource', {})
            billing_agreement_id = sale.get('billing_agreement_id')
            
            if billing_agreement_id:
                try:
                    client = Client.objects.get(paypal_subscription_id=billing_agreement_id)
                    client.payment_status = 'paid'
                    client.total_spent += Decimal(sale.get('amount', {}).get('total', 0))
                    
                    # Update next payment date (add 1 month)
                    from dateutil.relativedelta import relativedelta
                    if client.next_payment:
                        client.next_payment = client.next_payment + relativedelta(months=1)
                    
                    client.save()
                    logger.info(f"Payment completed via webhook for client {client.id}")
                except Client.DoesNotExist:
                    logger.warning(f"Client not found for billing agreement {billing_agreement_id}")
            
        elif event_type == 'PAYMENT.CAPTURE.COMPLETED':
            # Handle one-time payment completion
            capture = webhook_data.get('resource', {})
            capture_id = capture.get('id')
            logger.info(f"Payment {capture_id} completed via webhook")
        
        return JsonResponse({'status': 'success'})
        
    except Exception as e:
        logger.error(f"Error processing PayPal webhook: {e}")
        return JsonResponse({'error': 'Webhook processing failed'}, status=500)


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
                'subscription': None,
                'message': 'No client profile found'
            })
        
        # If no PayPal subscription, return basic info
        if not client.paypal_subscription_id:
            return Response({
                'plan': client.current_plan or 'none',
                'planId': client.current_plan or 'none',
                'price': float(client.monthly_fee) if client.monthly_fee else 0,
                'billing_cycle': 'monthly',
                'next_billing_date': client.next_payment.isoformat() if client.next_payment else None,
                'features': PAYPAL_PLANS.get(client.current_plan, {}).get('features', []) if client.current_plan else [],
                'status': 'none' if not client.current_plan else 'inactive',
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
            last_payment = billing_info.get('last_payment', {})
            
            # Get plan details
            plan_id = subscription.get('plan_id', '')
            current_plan = None
            plan_details = None
            
            for plan_key, plan_data in PAYPAL_PLANS.items():
                if plan_data['paypal_plan_id'] == plan_id:
                    current_plan = plan_key
                    plan_details = plan_data
                    break
            
            # Update local client record if needed
            if client.current_plan != current_plan and current_plan:
                client.current_plan = current_plan
                client.save()
            
            subscription_data = {
                'plan': current_plan or client.current_plan,
                'planId': current_plan or client.current_plan,
                'price': float(last_payment.get('amount', {}).get('value', 0)) if last_payment else plan_details.get('price', 0),
                'billing_cycle': 'monthly',
                'next_billing_date': next_billing_time,
                'features': plan_details.get('features', []) if plan_details else [],
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
                    'plan_id': plan_id,
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
                'plan': client.current_plan or 'none',
                'planId': client.current_plan or 'none',
                'price': float(client.monthly_fee) if client.monthly_fee else 0,
                'billing_cycle': 'monthly',
                'next_billing_date': client.next_payment.isoformat() if client.next_payment else None,
                'features': PAYPAL_PLANS.get(client.current_plan, {}).get('features', []) if client.current_plan else [],
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
        client.status = 'paused'
        client.subscription_end_date = timezone.now()
        client.save()
        
        logger.info(f"Subscription {client.paypal_subscription_id} cancelled for user {request.user.id}")
        
        return Response({
            'success': True,
            'message': 'Subscription cancelled successfully',
            'cancelled_at': timezone.now(),
            'reason': reason
        })
        
    except Exception as e:
        logger.error(f"Error cancelling subscription: {e}")
        return Response(
            {'error': 'Failed to cancel subscription'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_subscription_plan(request):
    """Update/upgrade the current subscription plan"""
    try:
        new_plan_id = request.data.get('plan_id')
        
        if not new_plan_id or new_plan_id not in PAYPAL_PLANS:
            return Response(
                {'error': 'Invalid plan selected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
                {'error': 'No active subscription found. Please create a new subscription.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        new_plan = PAYPAL_PLANS[new_plan_id]
        paypal_client = PayPalAPIClient()
        
        # Update subscription plan in PayPal
        update_data = {
            "plan_id": new_plan['paypal_plan_id'],
            "shipping_amount": {
                "currency_code": "USD",
                "value": "0.00"
            },
            "shipping_address": {
                "name": {
                    "full_name": f"{request.user.first_name} {request.user.last_name}"
                },
                "address": {
                    "address_line_1": "N/A",
                    "admin_area_2": "N/A", 
                    "admin_area_1": "N/A",
                    "postal_code": "00000",
                    "country_code": "US"
                }
            }
        }
        
        response = paypal_client.make_request(
            'POST',
            f'/v1/billing/subscriptions/{client.paypal_subscription_id}/revise',
            update_data
        )
        
        # Update local client record
        client.current_plan = new_plan_id
        client.monthly_fee = new_plan['price']
        client.save()
        
        logger.info(f"Subscription plan updated to {new_plan_id} for user {request.user.id}")
        
        return Response({
            'success': True,
            'message': f'Subscription updated to {new_plan["name"]}',
            'new_plan': {
                'id': new_plan_id,
                'name': new_plan['name'],
                'price': new_plan['price'],
                'features': new_plan['features']
            },
            'updated_at': timezone.now()
        })
        
    except Exception as e:
        logger.error(f"Error updating subscription plan: {e}")
        return Response(
            {'error': 'Failed to update subscription plan'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============ STUB FUNCTIONS FOR FRONTEND COMPATIBILITY ============
# These functions provide compatibility with the frontend but return
# appropriate responses indicating PayPal limitations

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_invoice_stub(request, invoice_id):
    """Stub for paying invoices - redirects to PayPal one-time payment"""
    try:
        # Get invoice details from the database
        from ..models import Invoice
        try:
            invoice = Invoice.objects.get(id=invoice_id, client__user=request.user)
        except Invoice.DoesNotExist:
            return Response(
                {'error': 'Invoice not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create a PayPal order for the invoice amount
        paypal_client = PayPalAPIClient()
        
        order_data = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "amount": {
                    "currency_code": "USD",
                    "value": str(float(invoice.amount))
                },
                "description": f"Invoice #{invoice.id}",
                "invoice_id": str(invoice.id)
            }],
            "application_context": {
                "brand_name": "VisionBoost",
                "locale": "en-US",
                "landing_page": "BILLING",
                "shipping_preference": "NO_SHIPPING",
                "user_action": "PAY_NOW",
                "return_url": f"{settings.FRONTEND_URL}/payment/success?invoice={invoice.id}",
                "cancel_url": f"{settings.FRONTEND_URL}/payment/cancel"
            }
        }
        
        order = paypal_client.make_request('POST', '/v2/checkout/orders', order_data)
        
        # Find approval URL
        approval_url = None
        for link in order.get('links', []):
            if link.get('rel') == 'approve':
                approval_url = link.get('href')
                break
        
        return Response({
            'order_id': order['id'],
            'approval_url': approval_url,
            'amount': float(invoice.amount),
            'invoice_id': str(invoice.id)
        })
        
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
    if not request.user.is_staff:
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    return Response({
        'provider': 'paypal',
        'settings': {
            'paypal_client_id': settings.PAYPAL_CLIENT_ID,
            'paypal_environment': 'sandbox' if 'sandbox' in settings.PAYPAL_BASE_URL else 'live',
            'webhook_url': f"{settings.BACKEND_URL}/api/billing/webhook/",
            'plans_configured': len(PAYPAL_PLANS),
            'available_plans': list(PAYPAL_PLANS.keys())
        }
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_admin_account_stub(request):
    """Stub for deleting admin account"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    return Response({
        'error': 'Account deletion must be performed manually for security reasons.',
        'message': 'Please contact system administrator for account deletion.'
    }, status=status.HTTP_400_BAD_REQUEST)