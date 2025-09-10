# server/api/payments/stripe_service.py
import stripe
import logging
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from ..models import Client, Invoice, User

logger = logging.getLogger(__name__)

class StripePaymentService:
    """Stripe payment processing service"""
    
    def __init__(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        self.webhook_secret = settings.STRIPE_WEBHOOK_SECRET
    
    def create_customer(self, user: User, client: Client) -> str:
        """Create a Stripe customer"""
        try:
            customer = stripe.Customer.create(
                email=user.email,
                name=f"{user.first_name} {user.last_name}",
                metadata={
                    'user_id': str(user.id),
                    'client_id': str(client.id),
                    'company': client.company,
                }
            )
            
            # Store customer ID in client model
            client.stripe_customer_id = customer.id
            client.save()
            
            logger.info(f"Created Stripe customer {customer.id} for client {client.name}")
            return customer.id
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create Stripe customer: {str(e)}")
            raise e
    
    def create_payment_intent(self, client: Client, amount: Decimal, description: str = None) -> dict:
        """Create a payment intent for one-time payment"""
        try:
            if not hasattr(client, 'stripe_customer_id') or not client.stripe_customer_id:
                self.create_customer(client.user, client)
            
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents
                currency='usd',
                customer=client.stripe_customer_id,
                description=description or f"Payment for {client.name} - {client.company}",
                metadata={
                    'client_id': str(client.id),
                    'company': client.company,
                }
            )
            
            return {
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id,
                'amount': amount,
                'currency': 'usd'
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create payment intent: {str(e)}")
            raise e
    
    def create_subscription(self, client: Client, price_id: str) -> dict:
        """Create a subscription for recurring payments"""
        try:
            if not hasattr(client, 'stripe_customer_id') or not client.stripe_customer_id:
                self.create_customer(client.user, client)
            
            subscription = stripe.Subscription.create(
                customer=client.stripe_customer_id,
                items=[{'price': price_id}],
                payment_behavior='default_incomplete',
                payment_settings={'save_default_payment_method': 'on_subscription'},
                expand=['latest_invoice.payment_intent'],
                metadata={
                    'client_id': str(client.id),
                    'package': client.package,
                }
            )
            
            # Store subscription ID
            client.stripe_subscription_id = subscription.id
            client.save()
            
            return {
                'subscription_id': subscription.id,
                'client_secret': subscription.latest_invoice.payment_intent.client_secret,
                'status': subscription.status
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create subscription: {str(e)}")
            raise e
    
    def cancel_subscription(self, client: Client) -> bool:
        """Cancel a client's subscription"""
        try:
            if not hasattr(client, 'stripe_subscription_id') or not client.stripe_subscription_id:
                return False
            
            stripe.Subscription.delete(client.stripe_subscription_id)
            
            # Update client status
            client.status = 'paused'
            client.stripe_subscription_id = None
            client.save()
            
            logger.info(f"Cancelled subscription for client {client.name}")
            return True
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to cancel subscription: {str(e)}")
            return False
    
    def handle_successful_payment(self, payment_intent_id: str, amount: int, client_id: str = None):
        """Handle successful payment webhook"""
        try:
            # Get payment intent details
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if not client_id:
                client_id = payment_intent.metadata.get('client_id')
            
            if not client_id:
                logger.error(f"No client_id found for payment intent {payment_intent_id}")
                return
            
            client = Client.objects.get(id=client_id)
            amount_decimal = Decimal(amount) / 100  # Convert from cents
            
            # Create or update invoice
            invoice, created = Invoice.objects.get_or_create(
                client=client,
                invoice_number=f"STRIPE-{payment_intent_id[:8]}",
                defaults={
                    'amount': amount_decimal,
                    'due_date': timezone.now().date(),
                    'status': 'paid',
                    'paid_at': timezone.now(),
                    'description': f"Stripe payment - {payment_intent.description}"
                }
            )
            
            if not created and invoice.status != 'paid':
                invoice.status = 'paid'
                invoice.paid_at = timezone.now()
                invoice.save()
            
            # Update client
            client.payment_status = 'paid'
            client.total_spent += amount_decimal
            client.next_payment = timezone.now().date() + timedelta(days=30)
            client.save()
            
            logger.info(f"Processed payment of ${amount_decimal} for client {client.name}")
            
        except Client.DoesNotExist:
            logger.error(f"Client not found for payment intent {payment_intent_id}")
        except Exception as e:
            logger.error(f"Error handling successful payment: {str(e)}")
    
    def handle_failed_payment(self, payment_intent_id: str, client_id: str = None):
        """Handle failed payment webhook"""
        try:
            if not client_id:
                payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
                client_id = payment_intent.metadata.get('client_id')
            
            if client_id:
                client = Client.objects.get(id=client_id)
                client.payment_status = 'overdue'
                client.save()
                
                logger.warning(f"Payment failed for client {client.name}")
                
        except Client.DoesNotExist:
            logger.error(f"Client not found for failed payment {payment_intent_id}")
        except Exception as e:
            logger.error(f"Error handling failed payment: {str(e)}")
    
    def get_customer_payment_methods(self, client: Client) -> list:
        """Get saved payment methods for customer"""
        try:
            if not hasattr(client, 'stripe_customer_id') or not client.stripe_customer_id:
                return []
            
            payment_methods = stripe.PaymentMethod.list(
                customer=client.stripe_customer_id,
                type="card"
            )
            
            return [
                {
                    'id': pm.id,
                    'brand': pm.card.brand,
                    'last4': pm.card.last4,
                    'exp_month': pm.card.exp_month,
                    'exp_year': pm.card.exp_year,
                    'is_default': pm.id == self.get_default_payment_method(client)
                }
                for pm in payment_methods.data
            ]
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to get payment methods: {str(e)}")
            return []
    
    def get_default_payment_method(self, client: Client) -> str:
        """Get default payment method ID"""
        try:
            if not hasattr(client, 'stripe_customer_id') or not client.stripe_customer_id:
                return None
            
            customer = stripe.Customer.retrieve(client.stripe_customer_id)
            return customer.invoice_settings.default_payment_method
            
        except stripe.error.StripeError:
            return None
    
    def create_setup_intent(self, client: Client) -> dict:
        """Create setup intent for saving payment method"""
        try:
            if not hasattr(client, 'stripe_customer_id') or not client.stripe_customer_id:
                self.create_customer(client.user, client)
            
            intent = stripe.SetupIntent.create(
                customer=client.stripe_customer_id,
                payment_method_types=['card'],
                usage='off_session'
            )
            
            return {
                'client_secret': intent.client_secret,
                'setup_intent_id': intent.id
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create setup intent: {str(e)}")
            raise e

# server/api/views/payment_views.py
import json
import stripe
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from ..models import Client
from ..payments.stripe_service import StripePaymentService

stripe_service = StripePaymentService()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """Create payment intent for one-time payment"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can make payments'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client = request.user.client_profile
        amount = request.data.get('amount')
        
        if not amount:
            return Response({'error': 'Amount is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        result = stripe_service.create_payment_intent(
            client=client,
            amount=amount,
            description=request.data.get('description')
        )
        
        return Response(result)
        
    except Exception as e:
        return Response({'error': str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subscription(request):
    """Create subscription for recurring payments"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can create subscriptions'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client = request.user.client_profile
        price_id = request.data.get('price_id')
        
        if not price_id:
            return Response({'error': 'Price ID is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        result = stripe_service.create_subscription(
            client=client,
            price_id=price_id
        )
        
        return Response(result)
        
    except Exception as e:
        return Response({'error': str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    """Cancel client subscription"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can cancel subscriptions'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client = request.user.client_profile
        success = stripe_service.cancel_subscription(client)
        
        if success:
            return Response({'message': 'Subscription cancelled successfully'})
        else:
            return Response({'error': 'No active subscription found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({'error': str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_methods(request):
    """Get saved payment methods"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can view payment methods'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client = request.user.client_profile
        payment_methods = stripe_service.get_customer_payment_methods(client)
        
        return Response({'payment_methods': payment_methods})
        
    except Exception as e:
        return Response({'error': str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_setup_intent(request):
    """Create setup intent for saving payment method"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can save payment methods'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client = request.user.client_profile
        result = stripe_service.create_setup_intent(client)
        
        return Response(result)
        
    except Exception as e:
        return Response({'error': str(e)}, 
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
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        stripe_service.handle_successful_payment(
            payment_intent['id'],
            payment_intent['amount'],
            payment_intent['metadata'].get('client_id')
        )
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        stripe_service.handle_failed_payment(
            payment_intent['id'],
            payment_intent['metadata'].get('client_id')
        )
    
    elif event['type'] == 'invoice.payment_succeeded':
        invoice = event['data']['object']
        # Handle subscription payment success
        subscription_id = invoice.get('subscription')
        if subscription_id:
            try:
                client = Client.objects.get(stripe_subscription_id=subscription_id)
                stripe_service.handle_successful_payment(
                    invoice['payment_intent'],
                    invoice['amount_paid'],
                    str(client.id)
                )
            except Client.DoesNotExist:
                pass
    
    elif event['type'] == 'invoice.payment_failed':
        invoice = event['data']['object']
        # Handle subscription payment failure
        subscription_id = invoice.get('subscription')
        if subscription_id:
            try:
                client = Client.objects.get(stripe_subscription_id=subscription_id)
                stripe_service.handle_failed_payment(
                    invoice['payment_intent'],
                    str(client.id)
                )
            except Client.DoesNotExist:
                pass
    
    return HttpResponse(status=200)
