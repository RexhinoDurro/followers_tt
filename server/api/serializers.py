# File: server/api/serializers.py
# Django REST Framework Serializers for SMMA Dashboard

from django.utils import timezone 
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (
    ContentImage, User, Client, Task, ContentPost, PerformanceData, 
    Message, Invoice, TeamMember, Project, File, Notification,
    SocialMediaAccount, RealTimeMetrics  # Add these imports
)

class UserSerializer(serializers.ModelSerializer):
    """User serializer for authentication and profile"""
    avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'company', 'avatar', 'bio']
        read_only_fields = ['id']
    
    def get_avatar(self, obj):
        """Return full URL for avatar"""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

class UserRegistrationSerializer(serializers.ModelSerializer):
    """User registration serializer - FIXED to always create client profiles"""
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'name', 'role', 'company']

    def create(self, validated_data):
        name = validated_data.pop('name')
        name_parts = name.split(' ', 1)
        validated_data['first_name'] = name_parts[0]
        validated_data['last_name'] = name_parts[1] if len(name_parts) > 1 else ''
        validated_data['username'] = validated_data['email']
        
        user = User.objects.create_user(**validated_data)
        
        # ALWAYS create client profile for any user (even if role is admin, they might need billing)
        # This ensures every user has a client profile for billing purposes
        try:
            from django.utils import timezone
            from datetime import timedelta
            future_date = timezone.now().date() + timedelta(days=30)
            
            Client.objects.create(
                user=user,
                name=name,
                email=validated_data['email'],
                company=validated_data.get('company', '') or 'Unknown Company',
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
            print(f"Created client profile for new user: {user.email}")
        except Exception as e:
            print(f"ERROR: Failed to create client profile for {user.email}: {e}")
            # Don't fail registration if client profile creation fails
            pass
        
        return user

class UserLoginSerializer(serializers.Serializer):
    """User login serializer"""
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError('User account is disabled.')
                data['user'] = user
            else:
                raise serializers.ValidationError('Unable to log in with provided credentials.')
        else:
            raise serializers.ValidationError('Must include email and password.')

        return data

# ADD MISSING SOCIAL MEDIA SERIALIZERS
class SocialMediaAccountSerializer(serializers.ModelSerializer):
    """Social Media Account serializer"""
    client_name = serializers.CharField(source='client.name', read_only=True)
    
    class Meta:
        model = SocialMediaAccount
        fields = [
            'id', 'client', 'client_name', 'platform', 'account_id',
            'username', 'is_active', 'last_sync', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_sync']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Get latest metrics
        try:
            latest_metrics = RealTimeMetrics.objects.filter(
                account=instance
            ).order_by('-date').first()
            
            if latest_metrics:
                data['followers_count'] = latest_metrics.followers_count
                data['engagement_rate'] = float(latest_metrics.engagement_rate)
                data['posts_count'] = latest_metrics.posts_count
            else:
                data['followers_count'] = 0
                data['engagement_rate'] = 0
                data['posts_count'] = 0
        except:
            data['followers_count'] = 0
            data['engagement_rate'] = 0
            data['posts_count'] = 0
            
        return data

class RealTimeMetricsSerializer(serializers.ModelSerializer):
    """Real-time metrics serializer"""
    account_username = serializers.CharField(source='account.username', read_only=True)
    account_platform = serializers.CharField(source='account.platform', read_only=True)
    
    class Meta:
        model = RealTimeMetrics
        fields = [
            'id', 'account', 'account_username', 'account_platform', 'date',
            'followers_count', 'following_count', 'posts_count', 'engagement_rate',
            'reach', 'impressions', 'profile_views', 'website_clicks',
            'daily_growth', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class ClientSerializer(serializers.ModelSerializer):
    """Enhanced Client serializer with user info"""
    user_id = serializers.CharField(source='user.id', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_avatar = serializers.ImageField(source='user.avatar', read_only=True)
    
    class Meta:
        model = Client
        fields = [
            'id', 'name', 'email', 'company', 'package', 'monthly_fee',
            'start_date', 'status', 'payment_status', 'platforms',
            'account_manager', 'next_payment', 'total_spent', 'notes',
            'created_at', 'updated_at',
            # Add user fields
            'user_id', 'user_first_name', 'user_last_name', 'user_email', 'user_avatar'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_id', 'user_first_name', 'user_last_name', 'user_email', 'user_avatar']


class TaskSerializer(serializers.ModelSerializer):
    """Task serializer"""
    client_name = serializers.CharField(source='client.name', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'client', 'client_name',
            'assigned_to', 'status', 'priority', 'due_date',
            'completed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ContentImageSerializer(serializers.ModelSerializer):
    """Content image serializer"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ContentImage
        fields = ['id', 'image', 'image_url', 'caption', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        elif obj.image:
            return obj.image.url
        return None


class ContentPostSerializer(serializers.ModelSerializer):
    """Content post serializer"""
    client_name = serializers.CharField(source='client.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    images = ContentImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    social_account_username = serializers.CharField(source='social_account.username', read_only=True)
    
    class Meta:
        model = ContentPost
        fields = [
            'id', 'client', 'client_name', 'social_account', 'social_account_username',
            'platform', 'title', 'content', 'scheduled_date', 'status',
            'images', 'uploaded_images', 'admin_message', 'post_url',
            'engagement_rate', 'likes', 'comments', 'shares', 'views',
            'approved_by', 'approved_by_name', 'approved_at', 'posted_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'client', 'created_at', 'updated_at', 
            'approved_at', 'posted_at', 'engagement_rate',
            'likes', 'comments', 'shares', 'views'
        ]
    
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # Create the content post
        content_post = ContentPost.objects.create(**validated_data)
        
        # Handle image uploads
        for i, image in enumerate(uploaded_images):
            ContentImage.objects.create(
                content_post=content_post,
                image=image,
                order=i
            )
        
        return content_post
    
    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', None)
        
        # Update content post
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle new images if provided
        if uploaded_images is not None:
            # Optionally delete old images or add new ones
            for i, image in enumerate(uploaded_images):
                ContentImage.objects.create(
                    content_post=instance,
                    image=image,
                    order=instance.images.count() + i
                )
        
        return instance

class PerformanceDataSerializer(serializers.ModelSerializer):
    """Performance data serializer"""
    client_name = serializers.CharField(source='client.name', read_only=True)
    
    class Meta:
        model = PerformanceData
        fields = [
            'id', 'client', 'client_name', 'month', 'followers',
            'engagement', 'reach', 'clicks', 'impressions',
            'growth_rate', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class MessageSerializer(serializers.ModelSerializer):
    """Message serializer"""
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.get_full_name', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'sender_name', 'receiver', 'receiver_name',
            'content', 'read', 'timestamp'
        ]
        read_only_fields = ['id', 'sender', 'timestamp']

class InvoiceSerializer(serializers.ModelSerializer):
    """Invoice serializer"""
    client_name = serializers.CharField(source='client.name', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'client', 'client_name', 'invoice_number', 'amount',
            'due_date', 'status', 'paid_at', 'description',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class TeamMemberSerializer(serializers.ModelSerializer):
    """Team member serializer"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = TeamMember
        fields = [
            'id', 'user', 'user_name', 'user_email', 'position',
            'department', 'hourly_rate', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class ProjectSerializer(serializers.ModelSerializer):
    """Project serializer"""
    client_name = serializers.CharField(source='client.name', read_only=True)
    team_member_names = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'client', 'client_name',
            'team_members', 'team_member_names', 'status', 'start_date',
            'end_date', 'budget', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_team_member_names(self, obj):
        return [member.user.get_full_name() for member in obj.team_members.all()]

class FileSerializer(serializers.ModelSerializer):
    """File serializer"""
    client_name = serializers.CharField(source='client.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = File
        fields = [
            'id', 'name', 'file', 'file_type', 'client', 'client_name',
            'uploaded_by', 'uploaded_by_name', 'size', 'created_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'size', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    """Notification serializer"""
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'title', 'message', 'notification_type',
            'read', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

# Dashboard Statistics Serializers
class DashboardStatsSerializer(serializers.Serializer):
    """Dashboard statistics serializer"""
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    active_clients = serializers.IntegerField()
    pending_tasks = serializers.IntegerField()
    overdue_payments = serializers.IntegerField()
    total_followers_delivered = serializers.IntegerField()
    monthly_growth_rate = serializers.DecimalField(max_digits=5, decimal_places=2)

class ClientDashboardStatsSerializer(serializers.Serializer):
    """Client dashboard statistics serializer"""
    total_followers = serializers.IntegerField()
    engagement_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    posts_this_month = serializers.IntegerField()
    reach = serializers.IntegerField()
    growth_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    next_payment_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    next_payment_date = serializers.DateField()

# Bulk Operations Serializers
class BulkTaskUpdateSerializer(serializers.Serializer):
    """Bulk task update serializer"""
    task_ids = serializers.ListField(child=serializers.UUIDField())
    status = serializers.ChoiceField(choices=Task.STATUS_CHOICES, required=False)
    assigned_to = serializers.CharField(max_length=255, required=False)
    priority = serializers.ChoiceField(choices=Task.PRIORITY_CHOICES, required=False)

class BulkContentApprovalSerializer(serializers.Serializer):
    """Bulk content approval serializer"""
    content_ids = serializers.ListField(child=serializers.UUIDField())
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    feedback = serializers.CharField(max_length=500, required=False)

# Analytics Serializers
class MonthlyPerformanceSerializer(serializers.Serializer):
    """Monthly performance analytics serializer"""
    month = serializers.DateField()
    total_followers = serializers.IntegerField()
    total_engagement = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_reach = serializers.IntegerField()
    total_clicks = serializers.IntegerField()
    growth_rate = serializers.DecimalField(max_digits=5, decimal_places=2)

class ClientPerformanceReportSerializer(serializers.Serializer):
    """Client performance report serializer"""
    client_name = serializers.CharField()
    period = serializers.CharField()
    metrics = MonthlyPerformanceSerializer(many=True)
    summary = serializers.DictField()

# File Upload Serializers
class FileUploadSerializer(serializers.ModelSerializer):
    """File upload serializer"""
    class Meta:
        model = File
        fields = ['name', 'file', 'file_type', 'client']
    
    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        validated_data['size'] = validated_data['file'].size
        return super().create(validated_data)