# api/views/paypal_billing_views.py
import logging
import json
from decimal import Decimal
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import requests

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
            # TODO: Update user's subscription in database
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
        # TODO: Verify webhook signature
        webhook_data = json.loads(request.body)
        event_type = webhook_data.get('event_type')
        
        logger.info(f"Received PayPal webhook: {event_type}")
        
        if event_type == 'BILLING.SUBSCRIPTION.ACTIVATED':
            # Handle subscription activation
            subscription = webhook_data.get('resource', {})
            subscription_id = subscription.get('id')
            logger.info(f"Subscription {subscription_id} activated via webhook")
            
        elif event_type == 'BILLING.SUBSCRIPTION.CANCELLED':
            # Handle subscription cancellation
            subscription = webhook_data.get('resource', {})
            subscription_id = subscription.get('id')
            logger.info(f"Subscription {subscription_id} cancelled via webhook")
            
        elif event_type == 'PAYMENT.CAPTURE.COMPLETED':
            # Handle payment completion
            capture = webhook_data.get('resource', {})
            capture_id = capture.get('id')
            logger.info(f"Payment {capture_id} completed via webhook")
        
        return JsonResponse({'status': 'success'})
        
    except Exception as e:
        logger.error(f"Error processing PayPal webhook: {e}")
        return JsonResponse({'error': 'Webhook processing failed'}, status=500)