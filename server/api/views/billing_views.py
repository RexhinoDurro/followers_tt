# server/api/views/billing_views.py - Enhanced with missing features
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
from django.db import models, transaction
import json

from ..models import User, Client, Invoice
from ..serializers import InvoiceSerializer

logger = logging.getLogger(__name__)

# Configure Stripe
try:
    stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', None)
    if not stripe.api_key:
        logger.error("❌ STRIPE_SECRET_KEY not found in settings")
    else:
        logger.info("✅ Stripe configured successfully")
except Exception as e:
    logger.error(f"❌ Error configuring Stripe: {str(e)}")

# Plan configurations - updated to match frontend exactly
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

def create_invoice_record(client, amount, description, stripe_payment_id=None, status='paid'):
    """Create an invoice record in the database with unique invoice number"""
    base_number = timezone.now().strftime('%Y%m%d')
    timestamp = timezone.now().strftime('%H%M%S')
    
    if stripe_payment_id:
        invoice_number = f"STRIPE-{stripe_payment_id[:8].upper()}-{timestamp}"
    else:
        invoice_number = f"INV-{base_number}-{client.id.hex[:6].upper()}-{timestamp}"
    
    # Ensure uniqueness by adding a suffix if needed
    suffix = 1
    while Invoice.objects.filter(invoice_number=invoice_number).exists():
        if stripe_payment_id:
            invoice_number = f"STRIPE-{stripe_payment_id[:8].upper()}-{timestamp}-{suffix}"
        else:
            invoice_number = f"INV-{base_number}-{client.id.hex[:6].upper()}-{timestamp}-{suffix}"
        suffix += 1
    
    invoice = Invoice.objects.create(
        client=client,
        invoice_number=invoice_number,
        amount=amount,
        due_date=timezone.now().date(),
        status=status,
        paid_at=timezone.now() if status == 'paid' else None,
        description=description
    )
    
    logger.info(f"Created invoice {invoice.invoice_number} for {client.name}: ${amount}")
    return invoice

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_plans(request):
    """Get all available subscription plans"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can view plans'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client = request.user.client_profile
        current_plan = getattr(client, 'current_plan', None)
        
        plans = []
        for plan_id, plan_config in PLAN_CONFIGS.items():
            plans.append({
                'id': plan_id,
                'name': plan_config['name'],
                'price': plan_config['price'],
                'features': plan_config['features'],
                'isCurrent': plan_id == current_plan
            })
        
        return Response({'plans': plans})
        
    except Exception as e:
        logger.error(f"Error getting available plans: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                        'subscriptionId': subscription.id,
                        'can_cancel': subscription.cancel_at_period_end != True,
                        'cancel_at_period_end': subscription.cancel_at_period_end
                    })
                    
            except stripe.error.StripeError as e:
                logger.error(f"Stripe error getting subscription: {str(e)}")
                pass
        
        return Response(None)  # No active subscription
        
    except Exception as e:
        logger.error(f"Error getting subscription: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subscription(request):
    """Create a new subscription with comprehensive error handling"""
    try:
        logger.info(f"🔄 Subscription creation request from user: {request.user.email}")
        
        if not stripe.api_key:
            logger.error("❌ Stripe not configured")
            return Response({
                'error': 'Payment processing not configured. Please contact support.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        if request.user.role != 'client':
            return Response({'error': 'Only clients can create subscriptions'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        price_id = request.data.get('price_id')
        plan_name = request.data.get('plan_name')
        
        if not price_id or not plan_name:
            return Response({
                'error': 'Price ID and plan name are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        client = request.user.client_profile
        
        # Extract and validate plan ID
        plan_id = price_id.replace('price_', '').replace('_monthly', '')
        plan_config = PLAN_CONFIGS.get(plan_id)
        if not plan_config:
            return Response({
                'error': f'Invalid plan: {plan_id}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check for existing subscription
        if hasattr(client, 'stripe_subscription_id') and client.stripe_subscription_id:
            try:
                existing_sub = stripe.Subscription.retrieve(client.stripe_subscription_id)
                if existing_sub.status in ['active', 'trialing']:
                    return Response({
                        'error': 'You already have an active subscription. Please cancel or change your current plan.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except stripe.error.StripeError:
                pass
        
        with transaction.atomic():
            # Create or get Stripe customer
            if not hasattr(client, 'stripe_customer_id') or not client.stripe_customer_id:
                customer = stripe.Customer.create(
                    email=request.user.email,
                    name=f"{request.user.first_name} {request.user.last_name}".strip() or client.name,
                    metadata={
                        'user_id': str(request.user.id),
                        'client_id': str(client.id),
                        'django_user': request.user.email
                    }
                )
                client.stripe_customer_id = customer.id
                client.save()
            else:
                customer = stripe.Customer.retrieve(client.stripe_customer_id)
            
            # Create Stripe price
            stripe_price = stripe.Price.create(
                unit_amount=int(plan_config['price'] * 100),
                currency='usd',
                recurring={'interval': 'month'},
                product_data={
                    'name': f"Instagram Growth - {plan_config['name']} Plan"
                }
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
                    'plan_name': plan_config['name'],
                    'user_email': request.user.email
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
        
        # Get client secret
        client_secret = None
        if (subscription.latest_invoice and 
            hasattr(subscription.latest_invoice, 'payment_intent') and
            subscription.latest_invoice.payment_intent):
            
            if hasattr(subscription.latest_invoice.payment_intent, 'client_secret'):
                client_secret = subscription.latest_invoice.payment_intent.client_secret
            else:
                try:
                    payment_intent = stripe.PaymentIntent.retrieve(subscription.latest_invoice.payment_intent)
                    client_secret = payment_intent.client_secret
                except stripe.error.StripeError:
                    pass
        
        response_data = {
            'subscription_id': subscription.id,
            'client_secret': client_secret,
            'status': subscription.status,
            'plan_name': plan_config['name'],
            'amount': plan_config['price'],
            'customer_id': customer.id
        }
        
        return Response(response_data)
        
    except stripe.error.StripeError as e:
        logger.error(f"❌ Stripe error: {str(e)}")
        return Response({
            'error': f'Payment processing error: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"💥 Unexpected error in create_subscription: {str(e)}")
        return Response({
            'error': 'Internal server error. Please contact support.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_subscription_plan(request):
    """Change subscription plan with proper proration"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can change subscriptions'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        new_plan_id = request.data.get('plan_id')
        if not new_plan_id:
            return Response({'error': 'New plan ID is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        new_plan_config = PLAN_CONFIGS.get(new_plan_id)
        if not new_plan_config:
            return Response({'error': f'Invalid plan: {new_plan_id}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        client = request.user.client_profile
        
        if not hasattr(client, 'stripe_subscription_id') or not client.stripe_subscription_id:
            return Response({'error': 'No active subscription found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Get current subscription
        current_subscription = stripe.Subscription.retrieve(client.stripe_subscription_id)
        
        if not current_subscription or current_subscription.status != 'active':
            return Response({'error': 'No active subscription found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Check if it's the same plan
        if client.current_plan == new_plan_id:
            return Response({'error': 'You are already on this plan'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Create new price for the new plan
        new_stripe_price = stripe.Price.create(
            unit_amount=int(new_plan_config['price'] * 100),
            currency='usd',
            recurring={'interval': 'month'},
            product_data={
                'name': f"Instagram Growth - {new_plan_config['name']} Plan"
            }
        )
        
        # Calculate proration preview
        current_price = int(client.monthly_fee * 100)  # Current price in cents
        new_price = int(new_plan_config['price'] * 100)  # New price in cents
        
        # Get current period info
        period_start = current_subscription.current_period_start
        period_end = current_subscription.current_period_end
        now = int(timezone.now().timestamp())
        
        # Calculate remaining ratio in current period
        total_period_seconds = period_end - period_start
        remaining_seconds = period_end - now
        remaining_ratio = remaining_seconds / total_period_seconds if total_period_seconds > 0 else 0
        
        # Calculate proration amount
        unused_credit = int(current_price * remaining_ratio)  # Credit from current plan
        new_charge = int(new_price * remaining_ratio)  # Charge for new plan
        proration_amount = new_charge - unused_credit  # Net amount
        
        with transaction.atomic():
            # Update subscription with new price
            updated_subscription = stripe.Subscription.modify(
                client.stripe_subscription_id,
                items=[{
                    'id': current_subscription['items']['data'][0].id,
                    'price': new_stripe_price.id,
                }],
                proration_behavior='create_prorations',
                metadata={
                    'client_id': str(client.id),
                    'plan_id': new_plan_id,
                    'plan_name': new_plan_config['name'],
                    'previous_plan': client.current_plan,
                }
            )
            
            # Update client record
            old_plan = client.current_plan
            old_package = client.package
            
            client.current_plan = new_plan_id
            client.package = new_plan_config['name']
            client.monthly_fee = new_plan_config['price']
            client.save()
            
            # Create invoice record for the plan change
            if proration_amount != 0:
                proration_amount_dollars = Decimal(abs(proration_amount)) / 100
                
                if proration_amount > 0:
                    # Upgrade - charge difference
                    description = f"Plan upgrade: {old_package} → {new_plan_config['name']} (prorated)"
                else:
                    # Downgrade - credit difference
                    description = f"Plan downgrade: {old_package} → {new_plan_config['name']} (credit applied)"
                
                try:
                    create_invoice_record(
                        client=client,
                        amount=proration_amount_dollars,
                        description=description,
                        status='paid'
                    )
                except Exception as invoice_error:
                    logger.error(f"Failed to create invoice record: {str(invoice_error)}")
                    # Continue with plan change even if invoice creation fails
                    # The payment was already processed by Stripe
        
        return Response({
            'message': f'Plan changed from {old_package} to {new_plan_config["name"]}',
            'new_plan': {
                'id': new_plan_id,
                'name': new_plan_config['name'],
                'price': new_plan_config['price'],
                'features': new_plan_config['features']
            },
            'proration_amount': float(proration_amount) / 100,
            'next_billing_date': timezone.datetime.fromtimestamp(
                updated_subscription.current_period_end
            ).isoformat()
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error changing plan: {str(e)}")
        return Response({'error': f'Payment processing error: {str(e)}'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error changing plan: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    """Cancel current subscription with options"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can cancel subscriptions'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client = request.user.client_profile
        
        if not hasattr(client, 'stripe_subscription_id') or not client.stripe_subscription_id:
            return Response({'error': 'No active subscription found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Options for cancellation
        cancel_immediately = request.data.get('cancel_immediately', False)
        reason = request.data.get('reason', 'Customer request')
        
        with transaction.atomic():
            if cancel_immediately:
                # Cancel immediately with proration
                subscription = stripe.Subscription.delete(
                    client.stripe_subscription_id,
                    prorate=True
                )
                
                # Update client immediately
                client.status = 'paused'
                client.stripe_subscription_id = None
                client.current_plan = None
                client.package = 'No Plan'
                client.monthly_fee = 0
                client.save()
                
                message = 'Subscription cancelled immediately'
                
            else:
                # Cancel at period end
                subscription = stripe.Subscription.modify(
                    client.stripe_subscription_id,
                    cancel_at_period_end=True,
                    metadata={
                        'cancellation_reason': reason,
                        'cancelled_by': str(request.user.id)
                    }
                )
                
                message = 'Subscription will be cancelled at the end of the current billing period'
        
        # Create cancellation record
        create_invoice_record(
            client=client,
            amount=0,
            description=f"Subscription cancellation - {client.package}. Reason: {reason}",
            status='paid'
        )
        
        return Response({
            'message': message,
            'cancelled_immediately': cancel_immediately,
            'period_end': timezone.datetime.fromtimestamp(
                subscription.current_period_end
            ).isoformat() if hasattr(subscription, 'current_period_end') else None,
            'access_until': timezone.datetime.fromtimestamp(
                subscription.current_period_end
            ).isoformat() if not cancel_immediately and hasattr(subscription, 'current_period_end') else None
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
def reactivate_subscription(request):
    """Reactivate a cancelled subscription"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can reactivate subscriptions'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client = request.user.client_profile
        
        if not hasattr(client, 'stripe_subscription_id') or not client.stripe_subscription_id:
            return Response({'error': 'No subscription found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Get subscription
        subscription = stripe.Subscription.retrieve(client.stripe_subscription_id)
        
        if subscription.cancel_at_period_end != True:
            return Response({'error': 'Subscription is not scheduled for cancellation'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Reactivate subscription
        updated_subscription = stripe.Subscription.modify(
            client.stripe_subscription_id,
            cancel_at_period_end=False
        )
        
        return Response({
            'message': 'Subscription reactivated successfully',
            'next_billing_date': timezone.datetime.fromtimestamp(
                updated_subscription.current_period_end
            ).isoformat()
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error reactivating subscription: {str(e)}")
        return Response({'error': f'Payment processing error: {str(e)}'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error reactivating subscription: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_invoice(request, invoice_id):
    """Pay a specific invoice"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can pay invoices'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Get the invoice
        try:
            client = request.user.client_profile
            invoice = Invoice.objects.get(id=invoice_id, client=client)
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        if invoice.status == 'paid':
            return Response({'error': 'Invoice is already paid'}, 
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
        
        # Create payment intent for the invoice
        intent = stripe.PaymentIntent.create(
            amount=int(invoice.amount * 100),  # Convert to cents
            currency='usd',
            customer=client.stripe_customer_id,
            description=f"Payment for invoice {invoice.invoice_number}",
            metadata={
                'client_id': str(client.id),
                'user_id': str(request.user.id),
                'invoice_id': str(invoice.id),
                'invoice_number': invoice.invoice_number,
                'type': 'invoice_payment'
            }
        )
        
        return Response({
            'client_secret': intent.client_secret,
            'payment_intent_id': intent.id,
            'amount': float(invoice.amount),
            'invoice_number': invoice.invoice_number,
            'description': invoice.description or f'Invoice {invoice.invoice_number}'
        })
        
    except Exception as e:
        logger.error(f"Error creating invoice payment: {str(e)}")
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
                'exp_month': pm.card.exp_month,
                'exp_year': pm.card.exp_year,
                'expiryDate': f"{pm.card.exp_month:02d}/{str(pm.card.exp_year)[-2:]}",
                'isDefault': pm.id == default_pm,
                'created': pm.created
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_default_payment_method(request, payment_method_id):
    """Set default payment method"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can manage payment methods'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client = request.user.client_profile
        
        if not hasattr(client, 'stripe_customer_id') or not client.stripe_customer_id:
            return Response({'error': 'No customer account found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Update customer's default payment method
        stripe.Customer.modify(
            client.stripe_customer_id,
            invoice_settings={'default_payment_method': payment_method_id}
        )
        
        return Response({'message': 'Default payment method updated'})
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error setting default payment method: {str(e)}")
        return Response({'error': f'Payment processing error: {str(e)}'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error setting default payment method: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_payment_method(request, payment_method_id):
    """Delete a saved payment method"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can manage payment methods'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client = request.user.client_profile
        
        if not hasattr(client, 'stripe_customer_id') or not client.stripe_customer_id:
            return Response({'error': 'No customer account found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Detach payment method
        stripe.PaymentMethod.detach(payment_method_id)
        
        return Response({'message': 'Payment method removed'})
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error deleting payment method: {str(e)}")
        return Response({'error': f'Payment processing error: {str(e)}'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error deleting payment method: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Webhook handlers (existing functionality)
def handle_successful_payment(payment_intent):
    """Handle successful one-time payment"""
    try:
        client_id = payment_intent['metadata'].get('client_id')
        invoice_id = payment_intent['metadata'].get('invoice_id')
        payment_type = payment_intent['metadata'].get('type', 'one_time_payment')
        
        if not client_id:
            return
        
        client = Client.objects.get(id=client_id)
        amount = Decimal(payment_intent['amount']) / 100
        
        # If this is for a specific invoice, update it
        if invoice_id:
            try:
                invoice = Invoice.objects.get(id=invoice_id)
                invoice.status = 'paid'
                invoice.paid_at = timezone.now()
                invoice.save()
                description = f"Payment for invoice {invoice.invoice_number}"
            except Invoice.DoesNotExist:
                description = payment_intent.get('description', 'One-time payment')
        else:
            # Create new invoice record
            description = payment_intent.get('description', 'One-time payment')
            create_invoice_record(
                client=client,
                amount=amount,
                description=description,
                stripe_payment_id=payment_intent['id'],
                status='paid'
            )
        
        # Update client
        client.total_spent += amount
        if payment_type == 'subscription_payment':
            client.payment_status = 'paid'
            client.next_payment = timezone.now().date() + timedelta(days=30)
        client.save()
        
        logger.info(f"Processed payment of ${amount} for client {client.name}")
        
    except Client.DoesNotExist:
        logger.error(f"Client not found for payment intent {payment_intent['id']}")
    except Exception as e:
        logger.error(f"Error handling successful payment: {str(e)}")

def handle_subscription_payment_success(invoice):
    """Handle successful subscription payment"""
    try:
        subscription_id = invoice.get('subscription')
        if not subscription_id:
            return
        
        client = Client.objects.get(stripe_subscription_id=subscription_id)
        amount = Decimal(invoice['amount_paid']) / 100
        
        # Create invoice record
        invoice_record = create_invoice_record(
            client=client,
            amount=amount,
            description=f"Monthly subscription - {client.package}",
            stripe_payment_id=invoice['id'],
            status='paid'
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

@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook(request):
    """Handle Stripe webhooks"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)
        if not webhook_secret:
            logger.error("No webhook secret configured")
            return HttpResponse(status=400)
            
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
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
    
    elif event['type'] == 'invoice.payment_succeeded':
        invoice = event['data']['object']
        handle_subscription_payment_success(invoice)
    
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        handle_subscription_updated(subscription)
    
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        handle_subscription_cancelled(subscription)
    
    return HttpResponse(status=200)

def handle_subscription_updated(subscription):
    """Handle subscription updates"""
    try:
        client = Client.objects.get(stripe_subscription_id=subscription['id'])
        
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
        
        create_invoice_record(
            client=client,
            amount=0,
            description=f"Subscription cancelled - {client.package}",
            status='paid'
        )
        
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

# Admin billing management
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_billing_settings(request):
    """Get admin billing settings"""
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    current_month = timezone.now().replace(day=1)
    total_revenue = Invoice.objects.filter(
        status='paid',
        paid_at__gte=current_month
    ).aggregate(total=models.Sum('amount'))['total'] or 0
    
    pending_payments = Invoice.objects.filter(status='pending').count()
    stripe_configured = bool(getattr(settings, 'STRIPE_SECRET_KEY', None))
    
    return Response({
        'stripe_account_connected': stripe_configured,
        'total_revenue_this_month': float(total_revenue),
        'pending_payments': pending_payments,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_admin_account(request):
    """Delete admin account (placeholder)"""
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    return Response({
        'message': 'Account deletion not implemented for safety. Please contact support.'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)