# server/api/views/billing_views.py - Fixed version
import stripe
import logging
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import models  # Fixed import
import json

from ..models import User, Client, Invoice
from ..serializers import InvoiceSerializer

logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

# Plan configurations - updated to match frontend
PLAN_CONFIGS = {
    'starter': {
        'name': 'Starter',
        'price': 100,
        'features': [
            '12 posts per month',
            '12 interactive stories', 
            'Hashtag research',
            'Monthly reports',
            'Ideal for small businesses'
        ]
    },
    'pro': {
        'name': 'Pro', 
        'price': 250,
        'features': [
            '20 posts + reels',
            'Monthly promotional areas',
            'Boost strategies',
            'Bio optimization', 
            'Report + recommendations',
            'Story engagement boost',
            'Aggressive boosting'
        ]
    },
    'premium': {
        'name': 'Premium',
        'price': 400,
        'features': [
            'Instagram + Facebook + TikTok',
            '30 posts (design, reels, carousel)',
            'Advertising on a budget',
            'Influencer outreach assistance',
            'Full and professional management'
        ]
    }
}

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_subscription(request):
    """Get current subscription details for client"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can view subscriptions'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client = request.user.client_profile
        
        # Check if client has a Stripe subscription
        if hasattr(client, 'stripe_subscription_id') and client.stripe_subscription_id:
            try:
                subscription = stripe.Subscription.retrieve(client.stripe_subscription_id)
                
                if subscription.status in ['active', 'trialing']:
                    # Get the plan details
                    plan_id = getattr(client, 'current_plan', 'starter')
                    plan_config = PLAN_CONFIGS.get(plan_id, PLAN_CONFIGS['starter'])
                    
                    return Response({
                        'plan': plan_config['name'],
                        'planId': plan_id,
                        'price': plan_config['price'],
                        'billing_cycle': 'monthly',
                        'next_billing_date': timezone.datetime.fromtimestamp(
                            subscription.current_period_end
                        ).isoformat(),
                        'features': plan_config['features'],
                        'status': subscription.status,
                        'subscriptionId': subscription.id
                    })
                    
            except stripe.error.StripeError as e:
                logger.error(f"Stripe error getting subscription: {str(e)}")
                pass
        
        return Response(None)  # No active subscription
        
    except Exception as e:
        logger.error(f"Error getting subscription: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Replace the create_subscription function in server/api/views/billing_views.py

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subscription(request):
    """Create a new subscription"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can create subscriptions'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        price_id = request.data.get('price_id')
        plan_name = request.data.get('plan_name')
        
        if not price_id or not plan_name:
            return Response({'error': 'Price ID and plan name are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        client = request.user.client_profile
        
        # Extract plan ID from price_id (e.g., 'price_starter_monthly' -> 'starter')
        plan_id = price_id.replace('price_', '').replace('_monthly', '')
        plan_config = PLAN_CONFIGS.get(plan_id)
        
        if not plan_config:
            return Response({'error': 'Invalid plan'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Create or get Stripe customer
        if not hasattr(client, 'stripe_customer_id') or not client.stripe_customer_id:
            customer = stripe.Customer.create(
                email=request.user.email,
                name=f"{request.user.first_name} {request.user.last_name}",
                metadata={
                    'user_id': str(request.user.id),
                    'client_id': str(client.id),
                }
            )
            client.stripe_customer_id = customer.id
            client.save()
        else:
            customer = stripe.Customer.retrieve(client.stripe_customer_id)
        
        # FIXED: Create price every time with unique parameters - no lookup_key
        stripe_price = stripe.Price.create(
            unit_amount=int(plan_config['price'] * 100),  # Convert to cents
            currency='usd',
            recurring={'interval': 'month'},
            product_data={
                'name': f"Instagram Growth - {plan_config['name']} Plan"
            }
            # Removed lookup_key to avoid conflicts
        )
        
        # Create subscription
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{'price': stripe_price.id}],
            payment_behavior='default_incomplete',
            payment_settings={'save_default_payment_method': 'on_subscription'},
            expand=['latest_invoice.payment_intent'],
            metadata={
                'client_id': str(client.id),
                'plan_id': plan_id,
                'plan_name': plan_name,
            }
        )
        
        # Update client record
        client.stripe_subscription_id = subscription.id
        client.current_plan = plan_id
        client.package = plan_config['name']
        client.monthly_fee = plan_config['price']
        client.status = 'active'
        client.next_payment = timezone.now().date() + timedelta(days=30)
        client.save()
        
        return Response({
            'subscription_id': subscription.id,
            'client_secret': subscription.latest_invoice.payment_intent.client_secret,
            'status': subscription.status
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating subscription: {str(e)}")
        return Response({'error': f'Payment processing error: {str(e)}'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error creating subscription: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    """Cancel current subscription"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can cancel subscriptions'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client = request.user.client_profile
        
        if not hasattr(client, 'stripe_subscription_id') or not client.stripe_subscription_id:
            return Response({'error': 'No active subscription found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Cancel the subscription at period end
        subscription = stripe.Subscription.modify(
            client.stripe_subscription_id,
            cancel_at_period_end=True
        )
        
        return Response({
            'message': 'Subscription will be cancelled at the end of the current billing period',
            'period_end': timezone.datetime.fromtimestamp(subscription.current_period_end).isoformat()
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error cancelling subscription: {str(e)}")
        return Response({'error': f'Payment processing error: {str(e)}'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error cancelling subscription: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """Create payment intent for one-time payments (like invoices)"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can make payments'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        amount = request.data.get('amount')
        description = request.data.get('description', 'Payment')
        
        if not amount:
            return Response({'error': 'Amount is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        client = request.user.client_profile
        
        # Create or get Stripe customer
        if not hasattr(client, 'stripe_customer_id') or not client.stripe_customer_id:
            customer = stripe.Customer.create(
                email=request.user.email,
                name=f"{request.user.first_name} {request.user.last_name}",
                metadata={
                    'user_id': str(request.user.id),
                    'client_id': str(client.id),
                }
            )
            client.stripe_customer_id = customer.id
            client.save()
        
        # Create payment intent
        intent = stripe.PaymentIntent.create(
            amount=int(float(amount) * 100),  # Convert to cents
            currency='usd',
            customer=client.stripe_customer_id,
            description=description,
            metadata={
                'client_id': str(client.id),
                'user_id': str(request.user.id),
            }
        )
        
        return Response({
            'client_secret': intent.client_secret,
            'payment_intent_id': intent.id,
            'amount': amount
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating payment intent: {str(e)}")
        return Response({'error': f'Payment processing error: {str(e)}'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error creating payment intent: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_methods(request):
    """Get customer's saved payment methods"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can view payment methods'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client = request.user.client_profile
        
        if not hasattr(client, 'stripe_customer_id') or not client.stripe_customer_id:
            return Response({'payment_methods': []})
        
        # Get payment methods from Stripe
        payment_methods = stripe.PaymentMethod.list(
            customer=client.stripe_customer_id,
            type='card'
        )
        
        # Get default payment method
        customer = stripe.Customer.retrieve(client.stripe_customer_id)
        default_pm = customer.invoice_settings.default_payment_method
        
        formatted_methods = []
        for pm in payment_methods.data:
            formatted_methods.append({
                'id': pm.id,
                'type': 'card',
                'brand': pm.card.brand,
                'last4': pm.card.last4,
                'expiryDate': f"{pm.card.exp_month:02d}/{str(pm.card.exp_year)[-2:]}",
                'isDefault': pm.id == default_pm
            })
        
        return Response({'payment_methods': formatted_methods})
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error getting payment methods: {str(e)}")
        return Response({'error': f'Payment processing error: {str(e)}'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error getting payment methods: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_setup_intent(request):
    """Create setup intent for saving payment methods"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can save payment methods'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client = request.user.client_profile
        
        # Create or get Stripe customer
        if not hasattr(client, 'stripe_customer_id') or not client.stripe_customer_id:
            customer = stripe.Customer.create(
                email=request.user.email,
                name=f"{request.user.first_name} {request.user.last_name}",
                metadata={
                    'user_id': str(request.user.id),
                    'client_id': str(client.id),
                }
            )
            client.stripe_customer_id = customer.id
            client.save()
        
        # Create setup intent
        intent = stripe.SetupIntent.create(
            customer=client.stripe_customer_id,
            payment_method_types=['card'],
            usage='off_session'
        )
        
        return Response({
            'client_secret': intent.client_secret,
            'setup_intent_id': intent.id
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating setup intent: {str(e)}")
        return Response({'error': f'Payment processing error: {str(e)}'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error creating setup intent: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook(request):
    """Handle Stripe webhooks"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        logger.error("Invalid payload in Stripe webhook")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid signature in Stripe webhook")
        return HttpResponse(status=400)
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        handle_successful_payment(payment_intent)
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        handle_failed_payment(payment_intent)
    
    elif event['type'] == 'invoice.payment_succeeded':
        invoice = event['data']['object']
        handle_subscription_payment_success(invoice)
    
    elif event['type'] == 'invoice.payment_failed':
        invoice = event['data']['object']
        handle_subscription_payment_failed(invoice)
    
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        handle_subscription_updated(subscription)
    
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        handle_subscription_cancelled(subscription)
    
    return HttpResponse(status=200)

def handle_successful_payment(payment_intent):
    """Handle successful one-time payment"""
    try:
        client_id = payment_intent['metadata'].get('client_id')
        if not client_id:
            return
        
        client = Client.objects.get(id=client_id)
        amount = Decimal(payment_intent['amount']) / 100  # Convert from cents
        
        # Create invoice record
        invoice = Invoice.objects.create(
            client=client,
            invoice_number=f"PAY-{payment_intent['id'][:8]}",
            amount=amount,
            due_date=timezone.now().date(),
            status='paid',
            paid_at=timezone.now(),
            description=payment_intent.get('description', 'One-time payment')
        )
        
        # Update client
        client.total_spent += amount
        client.payment_status = 'paid'
        client.save()
        
        logger.info(f"Processed one-time payment of ${amount} for client {client.name}")
        
    except Client.DoesNotExist:
        logger.error(f"Client not found for payment intent {payment_intent['id']}")
    except Exception as e:
        logger.error(f"Error handling successful payment: {str(e)}")

def handle_failed_payment(payment_intent):
    """Handle failed payment"""
    try:
        client_id = payment_intent['metadata'].get('client_id')
        if client_id:
            client = Client.objects.get(id=client_id)
            client.payment_status = 'overdue'
            client.save()
            logger.warning(f"Payment failed for client {client.name}")
    except Client.DoesNotExist:
        logger.error(f"Client not found for failed payment {payment_intent['id']}")
    except Exception as e:
        logger.error(f"Error handling failed payment: {str(e)}")

def handle_subscription_payment_success(invoice):
    """Handle successful subscription payment"""
    try:
        subscription_id = invoice.get('subscription')
        if not subscription_id:
            return
        
        client = Client.objects.get(stripe_subscription_id=subscription_id)
        amount = Decimal(invoice['amount_paid']) / 100  # Convert from cents
        
        # Create invoice record
        invoice_record = Invoice.objects.create(
            client=client,
            invoice_number=f"SUB-{invoice['id'][:8]}",
            amount=amount,
            due_date=timezone.now().date(),
            status='paid',
            paid_at=timezone.now(),
            description=f"Monthly subscription - {client.package}"
        )
        
        # Update client
        client.total_spent += amount
        client.payment_status = 'paid'
        client.next_payment = timezone.now().date() + timedelta(days=30)
        client.save()
        
        logger.info(f"Processed subscription payment of ${amount} for client {client.name}")
        
    except Client.DoesNotExist:
        logger.error(f"Client not found for subscription {subscription_id}")
    except Exception as e:
        logger.error(f"Error handling subscription payment success: {str(e)}")

def handle_subscription_payment_failed(invoice):
    """Handle failed subscription payment"""
    try:
        subscription_id = invoice.get('subscription')
        if subscription_id:
            client = Client.objects.get(stripe_subscription_id=subscription_id)
            client.payment_status = 'overdue'
            client.save()
            logger.warning(f"Subscription payment failed for client {client.name}")
    except Client.DoesNotExist:
        logger.error(f"Client not found for failed subscription payment")
    except Exception as e:
        logger.error(f"Error handling subscription payment failure: {str(e)}")

def handle_subscription_updated(subscription):
    """Handle subscription updates"""
    try:
        client = Client.objects.get(stripe_subscription_id=subscription['id'])
        
        # Update subscription status
        if subscription['status'] == 'active':
            client.status = 'active'
            client.payment_status = 'paid'
        elif subscription['status'] in ['past_due', 'unpaid']:
            client.payment_status = 'overdue'
        elif subscription['status'] == 'canceled':
            client.status = 'paused'
        
        client.save()
        logger.info(f"Updated subscription status for client {client.name}: {subscription['status']}")
        
    except Client.DoesNotExist:
        logger.error(f"Client not found for subscription {subscription['id']}")
    except Exception as e:
        logger.error(f"Error handling subscription update: {str(e)}")

def handle_subscription_cancelled(subscription):
    """Handle subscription cancellation"""
    try:
        client = Client.objects.get(stripe_subscription_id=subscription['id'])
        client.status = 'paused'
        client.stripe_subscription_id = None
        client.current_plan = None
        client.package = 'No Plan'
        client.monthly_fee = 0
        client.save()
        
        logger.info(f"Cancelled subscription for client {client.name}")
        
    except Client.DoesNotExist:
        logger.error(f"Client not found for cancelled subscription {subscription['id']}")
    except Exception as e:
        logger.error(f"Error handling subscription cancellation: {str(e)}")

# Admin billing management views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_billing_settings(request):
    """Get admin billing settings"""
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    # Calculate revenue this month
    current_month = timezone.now().replace(day=1)
    total_revenue = Invoice.objects.filter(
        status='paid',
        paid_at__gte=current_month
    ).aggregate(total=models.Sum('amount'))['total'] or 0
    
    pending_payments = Invoice.objects.filter(status='pending').count()
    
    # Return current admin settings
    return Response({
        'stripe_account_connected': bool(getattr(settings, 'STRIPE_SECRET_KEY', None)),
        'total_revenue_this_month': float(total_revenue),
        'pending_payments': pending_payments,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_admin_account(request):
    """Delete admin account (careful!)"""
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    password = request.data.get('password')
    if not password:
        return Response({'error': 'Password confirmation required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not request.user.check_password(password):
        return Response({'error': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)
    
    # You might want to add additional safeguards here
    # For now, just return a message
    return Response({
        'message': 'Account deletion not implemented for safety. Please contact support.'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)