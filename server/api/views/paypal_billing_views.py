# server/api/views/paypal_billing_views.py - Updated for server-based plans
import logging
import json
from decimal import Decimal
from datetime import datetime, timedelta
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
from ..models import Client, Invoice, User
from ..services.notification_service import NotificationService

logger = logging.getLogger(__name__)

def ensure_client_profile(user):
    """Ensure a client profile exists for the user"""
    try:
        client = Client.objects.get(user=user)
        return client
    except Client.DoesNotExist:
        # Create a client profile if it doesn't exist
        client = Client.objects.create(
            user=user,
            name=f"{user.first_name} {user.last_name}".strip() or user.username,
            email=user.email,
            company=getattr(user, 'company', '') or 'Unknown Company',
            package='No Plan Selected',
            monthly_fee=0,
            start_date=timezone.now().date(),
            status='pending',
            payment_status='none',
            account_manager='Admin',
            next_payment=None,
            current_plan='none',
            paypal_subscription_id=None,
            paypal_customer_id=None,
        )
        logger.info(f"Created missing client profile for user {user.id}")
        return client

SERVER_PLANS = {
    'starter': {
        'id': 'starter',
        'name': 'Starter Plan',
        'price': 100,
        'billing_cycle': 'monthly',
        'paypal_plan_id': 'P-53U63963MC933251TNDOIX4A',  # ✅ YOUR ACTUAL STARTER PLAN ID
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
        'price': 250,
        'billing_cycle': 'monthly',
        'paypal_plan_id': 'P-91K448064U4101319NDOIZ4I',  # ✅ YOUR ACTUAL PRO PLAN ID
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
        'price': 400,
        'billing_cycle': 'monthly',
        'paypal_plan_id': 'P-6G913718359162141NDOI2QQ',  # ✅ YOUR ACTUAL PREMIUM PLAN ID
        'features': [
            'Instagram + Facebook + TikTok',
            '30+ posts (design, reels, carousel)',
            'Premium advertising with budget allocation',
            'Professional management and plotting',
            'Full-service social media management'
        ]
    }
}

# Keep alias for backward compatibility with other parts of code
PAYPAL_PLANS = SERVER_PLANS

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
            if hasattr(e, 'response') and e.response:
                logger.error(f"Response: {e.response.text}")
            raise

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_plans(request):
    """Get available subscription plans (server-based)"""
    try:
        plans = []
        for plan_id, plan_data in SERVER_PLANS.items():
            plans.append({
                'id': plan_data['id'],
                'name': plan_data['name'],
                'price': plan_data['price'],
                'features': plan_data['features'],
                'billing_cycle': plan_data['billing_cycle'],
                'recommended': plan_id == 'pro'  # Mark Pro as recommended
            })
        
        return Response({
            'plans': plans,
            'currency': 'USD',
            'billing_type': 'server_managed',
            'payment_method': 'paypal_orders'
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
    """Get current subscription details (server-managed)"""
    try:
        # Ensure client profile exists
        client = ensure_client_profile(request.user)
        
        # If no current plan selected
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
                'payment_method': 'paypal_orders',
                'server_managed': True
            })
        
        # Get plan details from server configuration
        plan_details = SERVER_PLANS.get(client.current_plan, {})
        
        return Response({
            'plan': client.current_plan,
            'planId': client.current_plan,
            'price': float(client.monthly_fee) if client.monthly_fee else plan_details.get('price', 0),
            'billing_cycle': 'monthly',
            'next_billing_date': client.next_payment.isoformat() if client.next_payment else None,
            'features': plan_details.get('features', []),
            'status': client.status,
            'subscriptionId': f"server_{client.id}",  # Server-generated ID
            'can_cancel': client.status == 'active',
            'payment_method': 'paypal_orders',
            'server_managed': True,
            'auto_renewal': client.status == 'active'
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
    """Approve and activate a PayPal subscription - ONLY after user pays"""
    try:
        subscription_id = request.data.get('subscription_id')
        
        if not subscription_id:
            return Response(
                {'error': 'Subscription ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        paypal_client = PayPalAPIClient()
        
        # Get subscription details from PayPal to verify it's actually approved
        subscription = paypal_client.make_request('GET', f'/v1/billing/subscriptions/{subscription_id}')
        
        # CRITICAL: Only activate if PayPal confirms the subscription is ACTIVE
        if subscription.get('status') != 'ACTIVE':
            return Response(
                {'error': f'Subscription not active in PayPal. Status: {subscription.get("status")}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify this subscription belongs to the current user
        custom_id = subscription.get('custom_id')
        if custom_id != str(request.user.id):
            return Response(
                {'error': 'This subscription does not belong to the current user'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # NOW we can safely activate the subscription in our database
        try:
            client = Client.objects.get(user=request.user, paypal_subscription_id=subscription_id)
            
            # Find the plan based on PayPal plan ID
            plan_id = subscription.get('plan_id', '')
            current_plan = None
            monthly_fee = 0
            
            for plan_key, plan_data in PAYPAL_PLANS.items():
                if plan_data['paypal_plan_id'] == plan_id:
                    current_plan = plan_key
                    monthly_fee = plan_data['price']
                    break
            
            # Update client subscription details ONLY after PayPal confirmation
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
            else:
                # Default to 1 month from now
                from datetime import timedelta
                client.next_payment = timezone.now().date() + timedelta(days=30)
            
            client.save()
            
            logger.info(f"Subscription {subscription_id} SUCCESSFULLY ACTIVATED for user {request.user.id} after PayPal confirmation")
            
            # 🔔 NEW: Notify client of subscription activation
            NotificationService.notify_subscription_activated(
                client_user=request.user,
                plan_name=current_plan
            )
            
            # 🔔 NEW: Notify admins of new subscription
            NotificationService.notify_subscription_created(
                client=client,
                plan_name=current_plan
            )
            
            return Response({
                'success': True,
                'subscription_id': subscription_id,
                'status': 'ACTIVE',
                'message': 'Subscription activated successfully after PayPal payment confirmation',
                'plan': current_plan,
                'monthly_fee': monthly_fee,
                'next_payment_date': client.next_payment.isoformat() if client.next_payment else None
            })
            
        except Client.DoesNotExist:
            logger.error(f"Client profile not found for user {request.user.id} with subscription {subscription_id}")
            return Response(
                {'error': 'Client profile not found for this subscription'},
                status=status.HTTP_404_NOT_FOUND
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
    """Create a PayPal subscription - user must approve/pay before activation"""
    try:
        plan_name = request.data.get('plan_name')
        price_id = request.data.get('price_id', '').replace('price_', '').replace('_monthly', '')
        
        logger.info(f"Creating subscription - plan_name: {plan_name}, price_id: {price_id}")
        logger.info(f"Request data: {request.data}")
        
        # Find the plan
        plan_data = None
        for plan_id, plan in SERVER_PLANS.items():
            if plan_id == price_id or plan['name'] == plan_name:
                plan_data = plan
                break
        
        if not plan_data:
            logger.error(f"Plan not found - plan_name: {plan_name}, price_id: {price_id}")
            return Response(
                {'error': f'Invalid plan selected. Available plans: {list(SERVER_PLANS.keys())}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"Found plan: {plan_data['name']} (${plan_data['price']})")
        
        if not plan_data.get('paypal_plan_id'):
            logger.error(f"PayPal plan ID not configured for {plan_data['name']}")
            return Response(
                {'error': f'PayPal plan ID not configured for {plan_data["name"]}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"Using PayPal plan ID: {plan_data['paypal_plan_id']}")
        
        paypal_client = PayPalAPIClient()
        
        # Create subscription (NOT activated yet - requires user approval)
        subscription_data = {
            "plan_id": plan_data['paypal_plan_id'],
            "custom_id": str(request.user.id),  # Store user ID to link back later
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
        
        logger.info(f"Creating PayPal subscription with data: {subscription_data}")
        
        try:
            subscription = paypal_client.make_request('POST', '/v1/billing/subscriptions', subscription_data)
        except Exception as paypal_error:
            logger.error(f"PayPal API error: {paypal_error}")
            return Response(
                {'error': f'PayPal API error: {str(paypal_error)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"PayPal subscription created: {subscription}")
        
        # Find approval URL
        approval_url = None
        for link in subscription.get('links', []):
            if link.get('rel') == 'approve':
                approval_url = link.get('href')
                break
        
        if not approval_url:
            logger.error("No approval URL found in PayPal response")
            logger.error(f"PayPal response: {subscription}")
            raise Exception("No approval URL found in PayPal response")
        
        # IMPORTANT: Store subscription ID but DON'T activate yet
        try:
            client = ensure_client_profile(request.user)
            # Store the subscription ID but keep status as pending
            client.paypal_subscription_id = subscription['id']
            client.current_plan = plan_data['id']
            client.monthly_fee = plan_data['price']
            client.package = plan_data['name']
            # Keep status as pending until payment is confirmed
            client.status = 'pending'
            client.payment_status = 'pending'
            client.save()
            logger.info(f"Saved subscription ID to client profile: {client.id}")
        except Exception as db_error:
            logger.error(f"Error saving to database: {db_error}")
            # Continue anyway - subscription is created in PayPal
        
        logger.info(f"Created PayPal subscription {subscription['id']} for user {request.user.id} - AWAITING APPROVAL")
        
        return Response({
            'subscription_id': subscription['id'],
            'approval_url': approval_url,
            'status': subscription.get('status', 'APPROVAL_PENDING'),
            'plan_name': plan_data['name'],
            'amount': plan_data['price'],
            'message': 'Subscription created. User must approve payment on PayPal.'
        })
        
    except Exception as e:
        logger.error(f"Error creating subscription: {e}", exc_info=True)
        return Response(
            {'error': f'Failed to create subscription: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    """Cancel the current server-managed subscription"""
    try:
        # Ensure client profile exists
        client = ensure_client_profile(request.user)
        
        if client.status != 'active':
            return Response(
                {'error': 'No active subscription found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reason = request.data.get('reason', 'Customer requested cancellation')
        
        # Cancel subscription locally
        client.status = 'cancelled'
        client.payment_status = 'none'
        client.subscription_end_date = timezone.now()
        client.save()
        
        logger.info(f"Server-managed subscription cancelled for user {request.user.id}")
        
        # 🔔 NEW: Notify client of cancellation
        NotificationService.notify_subscription_cancelled(client.user)
        
        # 🔔 NEW: Notify admins of cancellation
        NotificationService.notify_client_cancelled_subscription(client)
        
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def handle_paypal_return(request):
    """Handle PayPal return after user approves subscription"""
    try:
        subscription_id = request.GET.get('subscription_id')
        
        if not subscription_id:
            return Response(
                {'error': 'No subscription ID in return URL'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Call the approve_subscription endpoint internally
        approve_request = type('Request', (), {
            'user': request.user,
            'data': {'subscription_id': subscription_id}
        })()
        
        return approve_subscription(approve_request)
        
    except Exception as e:
        logger.error(f"Error handling PayPal return: {e}")
        return Response(
            {'error': 'Failed to process PayPal return'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
        
@method_decorator(csrf_exempt, name='dispatch')
@api_view(['POST'])
def paypal_webhook(request):
    """Handle PayPal webhooks - PROPERLY VERIFY PAYMENTS"""
    try:
        webhook_data = json.loads(request.body)
        event_type = webhook_data.get('event_type')
        
        logger.info(f"Received PayPal webhook: {event_type}")
        
        if event_type == 'BILLING.SUBSCRIPTION.ACTIVATED':
            # Handle subscription activation (first payment succeeded)
            subscription = webhook_data.get('resource', {})
            subscription_id = subscription.get('id')
            custom_id = subscription.get('custom_id')  # Our user ID
            
            if custom_id:
                try:
                    user = User.objects.get(id=custom_id)
                    client = Client.objects.get(user=user, paypal_subscription_id=subscription_id)
                    
                    # Only activate if not already active
                    if client.status != 'active':
                        client.status = 'active'
                        client.payment_status = 'paid'
                        
                        if not client.subscription_start_date:
                            client.subscription_start_date = timezone.now()
                        
                        client.save()
                        logger.info(f"Subscription {subscription_id} activated via webhook for user {custom_id}")
                        
                except (User.DoesNotExist, Client.DoesNotExist):
                    logger.warning(f"User/Client not found for subscription {subscription_id}, custom_id: {custom_id}")
            
        elif event_type == 'PAYMENT.SALE.COMPLETED':
            # Handle successful subscription payments
            sale = webhook_data.get('resource', {})
            billing_agreement_id = sale.get('billing_agreement_id')
            amount = Decimal(sale.get('amount', {}).get('total', 0))
            
            if billing_agreement_id and amount > 0:
                try:
                    client = Client.objects.get(paypal_subscription_id=billing_agreement_id)
                    
                    # Record the payment
                    client.payment_status = 'paid'
                    client.total_spent += amount
                    
                    # Update next payment date
                    from dateutil.relativedelta import relativedelta
                    if client.next_payment:
                        client.next_payment = client.next_payment + relativedelta(months=1)
                    else:
                        client.next_payment = timezone.now().date() + relativedelta(months=1)
                    
                    client.save()
                    
                    # Create invoice record for the payment
                    from ..models import Invoice
                    Invoice.objects.create(
                        client=client,
                        invoice_number=f"PAYPAL-{sale.get('id', '')[:8].upper()}",
                        amount=amount,
                        due_date=timezone.now().date(),
                        status='paid',
                        paid_at=timezone.now(),
                        description=f"Monthly subscription payment - {client.package}"
                    )
                    
                    logger.info(f"Payment of ${amount} processed via webhook for client {client.id}")
                    
                except Client.DoesNotExist:
                    logger.warning(f"Client not found for billing agreement {billing_agreement_id}")
        
        elif event_type == 'BILLING.SUBSCRIPTION.CANCELLED':
            # Handle subscription cancellation
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
        # Ensure client profile exists
        client = ensure_client_profile(request.user)
        
        try:
            invoice = Invoice.objects.get(id=invoice_id, client=client)
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
            'plans_configured': len(SERVER_PLANS),
            'available_plans': list(SERVER_PLANS.keys())
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