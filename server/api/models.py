# File: server/api/models.py
# Django Models for SMMA Dashboard System

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from cryptography.fernet import Fernet
from django.conf import settings
import uuid
import json

class User(AbstractUser):
    """Extended User model with role-based access"""
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('client', 'Client'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')
    company = models.CharField(max_length=255, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"


class SocialMediaAccount(models.Model):
    """Social media accounts connected to clients"""
    PLATFORM_CHOICES = [
        ('instagram', 'Instagram'),
        ('tiktok', 'TikTok'),
        ('youtube', 'YouTube'),
        ('twitter', 'Twitter'),
        ('linkedin', 'LinkedIn'),
        ('facebook', 'Facebook'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey('Client', on_delete=models.CASCADE, related_name='social_accounts')
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    account_id = models.CharField(max_length=255)  # Platform-specific account ID
    username = models.CharField(max_length=255)
    access_token = models.TextField()  # Encrypted
    refresh_token = models.TextField(blank=True)  # Encrypted
    token_expires_at = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    last_sync = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['client', 'platform', 'account_id']

    def encrypt_token(self, token):
        """Encrypt access token"""
        f = Fernet(settings.ENCRYPTION_KEY.encode())
        return f.encrypt(token.encode()).decode()

    def decrypt_token(self, encrypted_token):
        """Decrypt access token"""
        f = Fernet(settings.ENCRYPTION_KEY.encode())
        return f.decrypt(encrypted_token.encode()).decode()

    def save(self, *args, **kwargs):
        if self.access_token and not self.access_token.startswith('gAAAAA'):  # Not encrypted
            self.access_token = self.encrypt_token(self.access_token)
        if self.refresh_token and not self.refresh_token.startswith('gAAAAA'):  # Not encrypted
            self.refresh_token = self.encrypt_token(self.refresh_token)
        super().save(*args, **kwargs)

class RealTimeMetrics(models.Model):
    """Real-time metrics from social media platforms"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    account = models.ForeignKey(SocialMediaAccount, on_delete=models.CASCADE, related_name='metrics')
    date = models.DateField()
    followers_count = models.IntegerField(default=0)
    following_count = models.IntegerField(default=0)
    posts_count = models.IntegerField(default=0)
    engagement_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    reach = models.IntegerField(default=0)
    impressions = models.IntegerField(default=0)
    profile_views = models.IntegerField(default=0)
    website_clicks = models.IntegerField(default=0)
    daily_growth = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ['account', 'date']
        ordering = ['-date']

class PostMetrics(models.Model):
    """Individual post metrics from social media platforms"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    account = models.ForeignKey(SocialMediaAccount, on_delete=models.CASCADE, related_name='post_metrics')
    post_id = models.CharField(max_length=255)  # Platform-specific post ID
    caption = models.TextField(blank=True)
    media_type = models.CharField(max_length=20)  # image, video, carousel
    posted_at = models.DateTimeField()
    likes = models.IntegerField(default=0)
    comments = models.IntegerField(default=0)
    shares = models.IntegerField(default=0)
    saves = models.IntegerField(default=0)
    reach = models.IntegerField(default=0)
    impressions = models.IntegerField(default=0)
    engagement_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['account', 'post_id']
        ordering = ['-posted_at']

class Client(models.Model):
    """Enhanced Client model with PayPal integration"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('pending', 'Pending'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),  # Added cancelled status
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('pending', 'Pending'),
        ('none', 'No Payment Required'),  # Added none status
    ]
    
    PLAN_CHOICES = [
        ('starter', 'Starter Plan'),
        ('pro', 'Pro Plan'),
        ('premium', 'Premium Plan'),
        ('none', 'No Plan Selected'),  # Added none option
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('User', on_delete=models.CASCADE, related_name='client_profile')
    name = models.CharField(max_length=255)
    email = models.EmailField()
    company = models.CharField(max_length=255)
    package = models.CharField(max_length=255, default='No Plan Selected')
    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    start_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='none')
    platforms = models.JSONField(default=list)
    account_manager = models.CharField(max_length=255, default='Admin')
    next_payment = models.DateField(null=True, blank=True)  # Allow null for no active subscription
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    # PAYPAL FIELDS (replacing Stripe fields)
    paypal_customer_id = models.CharField(max_length=255, blank=True, null=True)  # PayPal payer ID
    paypal_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    current_plan = models.CharField(
        max_length=50, 
        blank=True, 
        null=True, 
        choices=PLAN_CHOICES,
        default='none'
    )
    subscription_start_date = models.DateTimeField(blank=True, null=True)
    subscription_end_date = models.DateTimeField(blank=True, null=True)
    trial_end_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} - {self.company} ({self.get_current_plan_display()})"

    @property
    def total_followers(self):
        """Calculate total followers across all connected accounts"""
        from .models import RealTimeMetrics  # Import here to avoid circular import
        latest_metrics = RealTimeMetrics.objects.filter(
            account__client=self
        ).order_by('account', '-date').distinct('account')
        return sum(metric.followers_count for metric in latest_metrics)

    @property
    def average_engagement_rate(self):
        """Calculate average engagement rate across all accounts"""
        from .models import RealTimeMetrics  # Import here to avoid circular import
        latest_metrics = RealTimeMetrics.objects.filter(
            account__client=self
        ).order_by('account', '-date').distinct('account')
        
        if not latest_metrics:
            return 0
        
        total_engagement = sum(metric.engagement_rate for metric in latest_metrics)
        return total_engagement / len(latest_metrics)

    @property
    def has_active_subscription(self):
        """Check if client has an active PayPal subscription"""
        return bool(
            self.paypal_subscription_id and 
            self.status == 'active' and 
            self.current_plan and 
            self.current_plan != 'none'
        )

    @property
    def subscription_status_display(self):
        """Get human-readable subscription status"""
        if not self.current_plan or self.current_plan == 'none':
            return 'No Plan Selected'
        elif self.status == 'active':
            return f'Active - {self.get_current_plan_display()}'
        elif self.status == 'cancelled':
            return f'Cancelled - {self.get_current_plan_display()}'
        else:
            return f'{self.get_status_display()} - {self.get_current_plan_display()}'

    class Meta:
        ordering = ['-created_at']


class SyncLog(models.Model):
    """Track synchronization logs"""
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('in_progress', 'In Progress'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    account = models.ForeignKey(SocialMediaAccount, on_delete=models.CASCADE, related_name='sync_logs')
    sync_type = models.CharField(max_length=50)  # 'profile', 'posts', 'metrics'
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    records_processed = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-started_at']


class Task(models.Model):
    """Task management for SMMA operations"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in-progress', 'In Progress'),
        ('review', 'Review'),
        ('completed', 'Completed'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    due_date = models.DateTimeField()
    completed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.client.name}"

    class Meta:
        ordering = ['-created_at']


class ContentPost(models.Model):
    """Content management for social media posts"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending-approval', 'Pending Approval'),
        ('approved', 'Approved'),
        ('posted', 'Posted'),
    ]
    
    PLATFORM_CHOICES = [
        ('instagram', 'Instagram'),
        ('tiktok', 'TikTok'),
        ('youtube', 'YouTube'),
        ('linkedin', 'LinkedIn'),
        ('twitter', 'Twitter'),
        ('facebook', 'Facebook'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='content')
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    content = models.TextField()
    scheduled_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    image_url = models.URLField(blank=True, null=True)
    engagement_rate = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    posted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.platform} - {self.client.name} - {self.scheduled_date.date()}"

    class Meta:
        ordering = ['-scheduled_date']


class PerformanceData(models.Model):
    """Performance analytics for clients"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='performance')
    month = models.DateField()
    followers = models.IntegerField(default=0)
    engagement = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    reach = models.IntegerField(default=0)
    clicks = models.IntegerField(default=0)
    impressions = models.IntegerField(default=0)
    growth_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.client.name} - {self.month}"

    class Meta:
        ordering = ['-month']
        unique_together = ['client', 'month']

class Message(models.Model):
    """Messaging system between admin and clients"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"From {self.sender.username} to {self.receiver.username}"

    class Meta:
        ordering = ['-timestamp']

class Invoice(models.Model):
    """Invoice management for client billing"""
    STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('pending', 'Pending'),
        ('overdue', 'Overdue'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='invoices')
    invoice_number = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    paid_at = models.DateTimeField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"#{self.invoice_number} - {self.client.name}"

    class Meta:
        ordering = ['-created_at']

class TeamMember(models.Model):
    """Team members working on client accounts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='team_profile')
    position = models.CharField(max_length=255)
    department = models.CharField(max_length=100)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.position}"

class Project(models.Model):
    """Projects for organizing client work"""
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='projects')
    team_members = models.ManyToManyField(TeamMember, related_name='projects')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.client.name}"

    class Meta:
        ordering = ['-created_at']

class File(models.Model):
    """File storage for client assets"""
    FILE_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('document', 'Document'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='client_files/')
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='files')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    size = models.IntegerField()  # Size in bytes
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} - {self.client.name}"

    class Meta:
        ordering = ['-created_at']

class Notification(models.Model):
    """Notifications for users"""
    NOTIFICATION_TYPES = [
        ('task_assigned', 'Task Assigned'),
        ('payment_due', 'Payment Due'),
        ('content_approved', 'Content Approved'),
        ('message_received', 'Message Received'),
        ('performance_update', 'Performance Update'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.title} - {self.user.username}"

    class Meta:
        ordering = ['-created_at']