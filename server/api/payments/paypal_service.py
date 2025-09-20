# server/api/payments/paypal_service.py
import requests
import json
import logging
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from ..models import Client, Invoice, User

logger = logging.getLogger(__name__)

class PayPalPaymentService:
    """PayPal payment processing service"""
    
    def __init__(self):
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.client_secret = settings.PAYPAL_CLIENT_SECRET
        self.base_url = settings.PAYPAL_BASE_URL  # sandbox or live
        self.webhook_id = settings.PAYPAL_WEBHOOK_ID
        self.access_token = None
        self.token_expires_at = None
    
    def get_access_token(self):
        """Get PayPal access token"""
        if self.access_token and self.token_expires_at and timezone.now() < self.token_expires_at:
            return self.access_token
        
        try:
            url = f"{self.base_url}/v1/oauth2/token"
            headers = {
                'Accept': 'application/json',
                'Accept-Language': 'en_US',
            }
            data = 'grant_type=client_credentials'
            
            response = requests.post(
                url, 
                headers=headers, 
                data=data,
                auth=(self.client_id, self.client_secret)
            )
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data['access_token']
            self.token_expires_at = timezone.now() + timedelta(seconds=token_data['expires_in'] - 60)
            
            return self.access_token
            
        except requests.RequestException as e:
            logger.error(f"Failed to get PayPal access token: {str(e)}")
            raise e
    
    def get_headers(self):
        """Get headers with authorization"""
        return {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.get_access_token()}',
            'PayPal-Request-Id': str(timezone.now().timestamp()),
        }
    
    def create_payment_intent(self, client: Client, amount: Decimal, description: str = None) -> dict:
        """Create a PayPal order for one-time payment"""
        try:
            url = f"{self.base_url}/v2/checkout/orders"
            
            order_data = {
                "intent": "CAPTURE",
                "purchase_units": [{
                    "reference_id": f"client_{client.id}",
                    "description": description or f"Payment for {client.name} - {client.company}",
                    "custom_id": str(client.id),
                    "amount": {
                        "currency_code": "USD",
                        "value": str(amount)
                    }
                }],
                "payment_source": {
                    "paypal": {
                        "experience_context": {
                            "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED",
                            "brand_name": "SocialBoost Pro",
                            "locale": "en-US",
                            "landing_page": "LOGIN",
                            "shipping_preference": "NO_SHIPPING",
                            "user_action": "PAY_NOW",
                            "return_url": f"{settings.FRONTEND_URL}/payment/success",
                            "cancel_url": f"{settings.FRONTEND_URL}/payment/cancel"
                        }
                    }
                }
            }
            
            response = requests.post(url, headers=self.get_headers(), json=order_data)
            response.raise_for_status()
            order = response.json()
            
            # Get approval URL
            approval_url = None
            for link in order.get('links', []):
                if link['rel'] == 'approve':
                    approval_url = link['href']
                    break
            
            return {
                'order_id': order['id'],
                'approval_url': approval_url,
                'amount': amount,
                'currency': 'USD'
            }
            
        except requests.RequestException as e:
            logger.error(f"Failed to create PayPal order: {str(e)}")
            raise e
    
    def create_subscription(self, client: Client, plan_id: str) -> dict:
        """Create a PayPal subscription"""
        try:
            url = f"{self.base_url}/v1/billing/subscriptions"
            
            subscription_data = {
                "plan_id": plan_id,
                "custom_id": str(client.id),
                "application_context": {
                    "brand_name": "SocialBoost Pro",
                    "locale": "en-US",
                    "shipping_preference": "NO_SHIPPING",
                    "user_action": "SUBSCRIBE_NOW",
                    "payment_method": {
                        "payer_selected": "PAYPAL",
                        "payee_preferred": "IMMEDIATE_PAYMENT_REQUIRED"
                    },
                    "return_url": f"{settings.FRONTEND_URL}/subscription/success",
                    "cancel_url": f"{settings.FRONTEND_URL}/subscription/cancel"
                },
                "subscriber": {
                    "name": {
                        "given_name": client.user.first_name or "Customer",
                        "surname": client.user.last_name or "User"
                    },
                    "email_address": client.user.email
                }
            }
            
            response = requests.post(url, headers=self.get_headers(), json=subscription_data)
            response.raise_for_status()
            subscription = response.json()
            
            # Get approval URL
            approval_url = None
            for link in subscription.get('links', []):
                if link['rel'] == 'approve':
                    approval_url = link['href']
                    break
            
            return {
                'subscription_id': subscription['id'],
                'approval_url': approval_url,
                'status': subscription['status']
            }
            
        except requests.RequestException as e:
            logger.error(f"Failed to create PayPal subscription: {str(e)}")
            raise e
    
    def cancel_subscription(self, subscription_id: str, reason: str = "Customer request") -> bool:
        """Cancel a PayPal subscription"""
        try:
            url = f"{self.base_url}/v1/billing/subscriptions/{subscription_id}/cancel"
            
            cancel_data = {
                "reason": reason
            }
            
            response = requests.post(url, headers=self.get_headers(), json=cancel_data)
            response.raise_for_status()
            
            logger.info(f"Cancelled PayPal subscription {subscription_id}")
            return True
            
        except requests.RequestException as e:
            logger.error(f"Failed to cancel PayPal subscription: {str(e)}")
            return False
    
    def capture_order(self, order_id: str) -> dict:
        """Capture a PayPal order"""
        try:
            url = f"{self.base_url}/v2/checkout/orders/{order_id}/capture"
            
            response = requests.post(url, headers=self.get_headers())
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            logger.error(f"Failed to capture PayPal order: {str(e)}")
            raise e
    
    def get_subscription_details(self, subscription_id: str) -> dict:
        """Get PayPal subscription details"""
        try:
            url = f"{self.base_url}/v1/billing/subscriptions/{subscription_id}"
            
            response = requests.get(url, headers=self.get_headers())
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            logger.error(f"Failed to get PayPal subscription details: {str(e)}")
            raise e
    
    def create_subscription_plan(self, plan_config: dict) -> str:
        """Create a PayPal subscription plan"""
        try:
            # First create product
            product_url = f"{self.base_url}/v1/catalogs/products"
            product_data = {
                "name": f"Instagram Growth - {plan_config['name']} Plan",
                "description": f"Monthly subscription for {plan_config['name']} social media growth package",
                "type": "SERVICE",
                "category": "SOFTWARE"
            }
            
            product_response = requests.post(product_url, headers=self.get_headers(), json=product_data)
            product_response.raise_for_status()
            product = product_response.json()
            
            # Then create plan
            plan_url = f"{self.base_url}/v1/billing/plans"
            plan_data = {
                "product_id": product['id'],
                "name": f"{plan_config['name']} Monthly Plan",
                "description": f"Monthly subscription for {plan_config['name']} package",
                "status": "ACTIVE",
                "billing_cycles": [{
                    "frequency": {
                        "interval_unit": "MONTH",
                        "interval_count": 1
                    },
                    "tenure_type": "REGULAR",
                    "sequence": 1,
                    "total_cycles": 0,  # Infinite
                    "pricing_scheme": {
                        "fixed_price": {
                            "value": str(plan_config['price']),
                            "currency_code": "USD"
                        }
                    }
                }],
                "payment_preferences": {
                    "auto_bill_outstanding": True,
                    "setup_fee": {
                        "value": "0",
                        "currency_code": "USD"
                    },
                    "setup_fee_failure_action": "CONTINUE",
                    "payment_failure_threshold": 3
                },
                "taxes": {
                    "percentage": "0",
                    "inclusive": False
                }
            }
            
            plan_response = requests.post(plan_url, headers=self.get_headers(), json=plan_data)
            plan_response.raise_for_status()
            plan = plan_response.json()
            
            logger.info(f"Created PayPal plan {plan['id']} for {plan_config['name']}")
            return plan['id']
            
        except requests.RequestException as e:
            logger.error(f"Failed to create PayPal plan: {str(e)}")
            raise e
    
    def handle_successful_payment(self, order_data: dict, client_id: str = None):
        """Handle successful payment webhook"""
        try:
            if not client_id:
                # Extract from purchase units
                for unit in order_data.get('purchase_units', []):
                    client_id = unit.get('custom_id')
                    if client_id:
                        break
            
            if not client_id:
                logger.error(f"No client_id found for PayPal order {order_data.get('id')}")
                return
            
            client = Client.objects.get(id=client_id)
            
            # Get amount from purchase units
            amount = Decimal('0')
            for unit in order_data.get('purchase_units', []):
                amount += Decimal(unit.get('amount', {}).get('value', '0'))
            
            # Create invoice record
            invoice = Invoice.objects.create(
                client=client,
                invoice_number=f"PAYPAL-{order_data['id'][:8].upper()}",
                amount=amount,
                due_date=timezone.now().date(),
                status='paid',
                paid_at=timezone.now(),
                description=f"PayPal payment - Order {order_data['id']}"
            )
            
            # Update client
            client.payment_status = 'paid'
            client.total_spent += amount
            client.next_payment = timezone.now().date() + timedelta(days=30)
            client.save()
            
            logger.info(f"Processed PayPal payment of ${amount} for client {client.name}")
            
        except Client.DoesNotExist:
            logger.error(f"Client not found for PayPal payment {order_data.get('id')}")
        except Exception as e:
            logger.error(f"Error handling successful PayPal payment: {str(e)}")
    
    def handle_subscription_payment(self, subscription_data: dict):
        """Handle subscription payment webhook"""
        try:
            subscription_id = subscription_data.get('id')
            custom_id = subscription_data.get('custom_id')
            
            if not custom_id:
                logger.error(f"No custom_id found for PayPal subscription {subscription_id}")
                return
            
            client = Client.objects.get(id=custom_id)
            
            # Get billing info from subscription
            billing_info = subscription_data.get('billing_info', {})
            last_payment = billing_info.get('last_payment', {})
            amount = Decimal(last_payment.get('amount', {}).get('value', '0'))
            
            if amount > 0:
                # Create invoice record
                invoice = Invoice.objects.create(
                    client=client,
                    invoice_number=f"PAYPAL-SUB-{subscription_id[:8].upper()}",
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
            logger.error(f"Client not found for PayPal subscription {subscription_id}")
        except Exception as e:
            logger.error(f"Error handling PayPal subscription payment: {str(e)}")
    
    def verify_webhook_signature(self, request_body: str, headers: dict) -> bool:
        """Verify PayPal webhook signature"""
        try:
            # PayPal webhook verification
            verify_url = f"{self.base_url}/v1/notifications/verify-webhook-signature"
            
            verify_data = {
                "auth_algo": headers.get('PAYPAL-AUTH-ALGO'),
                "cert_id": headers.get('PAYPAL-CERT-ID'),
                "transmission_id": headers.get('PAYPAL-TRANSMISSION-ID'),
                "transmission_sig": headers.get('PAYPAL-TRANSMISSION-SIG'),
                "transmission_time": headers.get('PAYPAL-TRANSMISSION-TIME'),
                "webhook_id": self.webhook_id,
                "webhook_event": json.loads(request_body)
            }
            
            response = requests.post(verify_url, headers=self.get_headers(), json=verify_data)
            response.raise_for_status()
            
            verification_result = response.json()
            return verification_result.get('verification_status') == 'SUCCESS'
            
        except Exception as e:
            logger.error(f"Failed to verify PayPal webhook signature: {str(e)}")
            return False