# File: server/api/serializers.py
# Django REST Framework Serializers for SMMA Dashboard

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (
    User, Client, Task, ContentPost, PerformanceData, 
    Message, Invoice, TeamMember, Project, File, Notification
)

class UserSerializer(serializers.ModelSerializer):
    """User serializer for authentication and profile"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'company', 'avatar']
        read_only_fields = ['id']

class UserRegistrationSerializer(serializers.ModelSerializer):
    """User registration serializer"""
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
        
        # Create client profile if role is client
        if validated_data.get('role') == 'client':
            Client.objects.create(
                user=user,
                name=name,
                email=validated_data['email'],
                company=validated_data.get('company', ''),
                package='Basic Package',
                monthly_fee=1500,
                start_date=timezone.now().date(),
                account_manager='Admin',
                next_payment=timezone.now().date() + timezone.timedelta(days=30)
            )
        
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

class ClientSerializer(serializers.ModelSerializer):
    """Client serializer"""
    class Meta:
        model = Client
        fields = [
            'id', 'name', 'email', 'company', 'package', 'monthly_fee',
            'start_date', 'status', 'payment_status', 'platforms',
            'account_manager', 'next_payment', 'total_spent', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

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

class ContentPostSerializer(serializers.ModelSerializer):
    """Content post serializer"""
    client_name = serializers.CharField(source='client.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = ContentPost
        fields = [
            'id', 'client', 'client_name', 'platform', 'content',
            'scheduled_date', 'status', 'image_url', 'engagement_rate',
            'approved_by', 'approved_by_name', 'approved_at', 'posted_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'approved_at', 'posted_at']

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