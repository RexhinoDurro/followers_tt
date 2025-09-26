# server/api/management/commands/process_recurring_payments.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import Client, Invoice

# Import SERVER_PLANS from your billing views
SERVER_PLANS = {
    'starter': {'id': 'starter', 'name': 'Starter Plan', 'price': 100},
    'pro': {'id': 'pro', 'name': 'Pro Plan', 'price': 250},
    'premium': {'id': 'premium', 'name': 'Premium Plan', 'price': 400}
}

class Command(BaseCommand):
    """
    Django management command to process recurring payments
    Run this daily via cron job: python manage.py process_recurring_payments
    """
    help = 'Process recurring subscription payments'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be processed without making changes',
        )
    
    def handle(self, *args, **options):
        today = timezone.now().date()
        dry_run = options['dry_run']
        
        # Find clients whose next payment is due
        due_clients = Client.objects.filter(
            status='active',
            next_payment__lte=today,
            current_plan__isnull=False
        ).exclude(current_plan='none')
        
        if dry_run:
            self.stdout.write(f"DRY RUN: Would process {due_clients.count()} due payments...")
        else:
            self.stdout.write(f"Processing {due_clients.count()} due payments...")
        
        processed = 0
        failed = 0
        
        for client in due_clients:
            try:
                if dry_run:
                    self.show_client_payment(client)
                else:
                    self.process_client_payment(client)
                processed += 1
            except Exception as e:
                failed += 1
                self.stdout.write(
                    self.style.ERROR(f"Failed to process payment for {client.name}: {e}")
                )
        
        if dry_run:
            self.stdout.write(
                self.style.SUCCESS(f'DRY RUN completed: {processed} would be processed, {failed} would fail')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Recurring payment processing completed: {processed} processed, {failed} failed')
            )
    
    def show_client_payment(self, client):
        """Show what would be processed for a client (dry run)"""
        plan_data = SERVER_PLANS.get(client.current_plan)
        if not plan_data:
            raise Exception(f"Plan {client.current_plan} not found")
        
        self.stdout.write(f"Would create invoice for {client.name}:")
        self.stdout.write(f"  - Plan: {plan_data['name']}")
        self.stdout.write(f"  - Amount: ${plan_data['price']}")
        self.stdout.write(f"  - Due date: {timezone.now().date()}")
        self.stdout.write(f"  - Current payment status: {client.payment_status}")
    
    def process_client_payment(self, client):
        """Process recurring payment for a client"""
        plan_data = SERVER_PLANS.get(client.current_plan)
        if not plan_data:
            raise Exception(f"Plan {client.current_plan} not found")
        
        # Create invoice for next month
        invoice = Invoice.objects.create(
            client=client,
            invoice_number=f"REC-{timezone.now().strftime('%Y%m%d')}-{client.id.hex[:8].upper()}",
            amount=plan_data['price'],
            due_date=timezone.now().date(),
            status='pending',
            description=f"Monthly subscription - {plan_data['name']}"
        )
        
        # Update next payment date (1 month from now)
        client.next_payment = timezone.now().date() + timedelta(days=30)
        client.payment_status = 'pending'
        client.save()
        
        # TODO: Send email notification to client about pending payment
        # TODO: Optionally try to charge a saved payment method
        
        self.stdout.write(f"Created invoice {invoice.invoice_number} for {client.name} - ${plan_data['price']}")

# Also create the management directory structure if it doesn't exist:
# server/api/management/__init__.py (empty file)
# server/api/management/commands/__init__.py (empty file)