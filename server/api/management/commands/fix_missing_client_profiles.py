# server/api/management/commands/fix_missing_client_profiles.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import User, Client

class Command(BaseCommand):
    help = 'Create missing client profiles for existing users'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be created without making changes',
        )
    
    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Find users with role 'client' but no client profile
        users_without_profiles = User.objects.filter(
            role='client'
        ).exclude(
            id__in=Client.objects.values_list('user_id', flat=True)
        )
        
        if dry_run:
            self.stdout.write(f"DRY RUN: Would create {users_without_profiles.count()} client profiles")
        else:
            self.stdout.write(f"Creating {users_without_profiles.count()} missing client profiles...")
        
        created = 0
        
        for user in users_without_profiles:
            if dry_run:
                self.stdout.write(f"Would create profile for: {user.email} ({user.first_name} {user.last_name})")
            else:
                try:
                    # Set next_payment to a future date instead of None
                    from datetime import timedelta
                    future_date = timezone.now().date() + timedelta(days=30)
                    
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
                        next_payment=future_date,  # Use future date instead of None
                        current_plan='none',
                        paypal_subscription_id=None,
                        paypal_customer_id=None,
                    )
                    self.stdout.write(f"✅ Created profile for: {user.email}")
                    created += 1
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"❌ Failed to create profile for {user.email}: {e}")
                    )
        
        if dry_run:
            self.stdout.write(
                self.style.SUCCESS(f'DRY RUN completed: {users_without_profiles.count()} profiles would be created')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Created {created} client profiles successfully')
            )