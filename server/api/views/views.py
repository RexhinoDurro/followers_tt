# File: server/api/views.py
# Django REST Framework Views for SMMA Dashboard

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from django.contrib.auth import authenticate, login, logout
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from datetime import datetime, timedelta
import calendar
import logging
from django.urls import path
from celery import shared_task

from api import serializers
from api.tasks import update_client_monthly_performance

logger = logging.getLogger(__name__)

from ..models import (
    User, Client, Task, ContentPost, PerformanceData,
    Message, Invoice, TeamMember, Project, File, Notification
)
from ..serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    ClientSerializer, TaskSerializer, ContentPostSerializer,
    PerformanceDataSerializer, MessageSerializer, InvoiceSerializer,
    TeamMemberSerializer, ProjectSerializer, FileSerializer,
    NotificationSerializer, DashboardStatsSerializer,
    ClientDashboardStatsSerializer, BulkTaskUpdateSerializer,
    BulkContentApprovalSerializer, FileUploadSerializer
)

# Authentication Views
class RegisterView(generics.CreateAPIView):
    """User registration view"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    """User login view"""
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout view"""
    try:
        request.user.auth_token.delete()
    except:
        pass
    return Response({'message': 'Successfully logged out'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """Get current user profile"""
    return Response(UserSerializer(request.user).data)

# Dashboard Statistics Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats_view(request):
    """Get dashboard statistics for admin users"""
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    # Calculate stats
    current_month = timezone.now().replace(day=1)
    
    total_revenue = Invoice.objects.filter(
        status='paid',
        paid_at__gte=current_month
    ).aggregate(Sum('amount'))['amount__sum'] or 0
    
    active_clients = Client.objects.filter(status='active').count()
    pending_tasks = Task.objects.filter(status__in=['pending', 'in-progress']).count()
    overdue_payments = Invoice.objects.filter(status='overdue').count()
    
    # Total followers delivered (sum of all client followers)
    total_followers = PerformanceData.objects.aggregate(
        Sum('followers')
    )['followers__sum'] or 0
    
    # Monthly growth rate
    previous_month = current_month - timedelta(days=1)
    previous_month = previous_month.replace(day=1)
    
    current_month_followers = PerformanceData.objects.filter(
        month=current_month.date()
    ).aggregate(Sum('followers'))['followers__sum'] or 0
    
    previous_month_followers = PerformanceData.objects.filter(
        month=previous_month.date()
    ).aggregate(Sum('followers'))['followers__sum'] or 0
    
    monthly_growth_rate = 0
    if previous_month_followers > 0:
        monthly_growth_rate = ((current_month_followers - previous_month_followers) / previous_month_followers) * 100
    
    stats_data = {
        'total_revenue': total_revenue,
        'active_clients': active_clients,
        'pending_tasks': pending_tasks,
        'overdue_payments': overdue_payments,
        'total_followers_delivered': total_followers,
        'monthly_growth_rate': monthly_growth_rate
    }
    
    serializer = DashboardStatsSerializer(stats_data)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_dashboard_stats_view(request):
    """Get dashboard statistics for client users"""
    if request.user.role != 'client':
        return Response({'error': 'Client access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        client = request.user.client_profile
    except Client.DoesNotExist:
        return Response({'error': 'Client profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get latest performance data
    latest_performance = PerformanceData.objects.filter(
        client=client
    ).order_by('-month').first()
    
    # Posts this month
    current_month = timezone.now().replace(day=1)
    posts_this_month = ContentPost.objects.filter(
        client=client,
        created_at__gte=current_month
    ).count()
    
    # Growth rate calculation
    performance_data = PerformanceData.objects.filter(
        client=client
    ).order_by('-month')[:2]
    
    growth_rate = 0
    if len(performance_data) >= 2:
        current = performance_data[0]
        previous = performance_data[1]
        if previous.followers > 0:
            growth_rate = ((current.followers - previous.followers) / previous.followers) * 100
    
    stats_data = {
        'total_followers': latest_performance.followers if latest_performance else 0,
        'engagement_rate': latest_performance.engagement if latest_performance else 0,
        'posts_this_month': posts_this_month,
        'reach': latest_performance.reach if latest_performance else 0,
        'growth_rate': growth_rate,
        'next_payment_amount': client.monthly_fee,
        'next_payment_date': client.next_payment
    }
    
    serializer = ClientDashboardStatsSerializer(stats_data)
    return Response(serializer.data)


# server/api/views.py - Add these ViewSets and update existing file

from rest_framework.viewsets import ModelViewSet
from ..models import SocialMediaAccount, RealTimeMetrics
from ..serializers import SocialMediaAccountSerializer, RealTimeMetricsSerializer

class SocialMediaAccountViewSet(ModelViewSet):
    """Social Media Account management viewset"""
    serializer_class = SocialMediaAccountSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return SocialMediaAccount.objects.all()
        else:
            # Clients can only see their own accounts
            try:
                client = self.request.user.client_profile
                return SocialMediaAccount.objects.filter(client=client)
            except Client.DoesNotExist:
                return SocialMediaAccount.objects.none()
    
    def perform_create(self, serializer):
        # Only admins can create accounts manually
        if self.request.user.role != 'admin':
            raise PermissionError('Admin access required')
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """Trigger manual sync for account"""
        account = self.get_object()
        
        # Check permission
        if request.user.role == 'client':
            try:
                client = request.user.client_profile
                if account.client != client:
                    return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            except Client.DoesNotExist:
                return Response({'error': 'Client profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Trigger sync task
        if account.platform == 'instagram':
            from api.tasks import sync_instagram_data
            task = sync_instagram_data.delay(str(account.id))
        elif account.platform == 'youtube':
            from api.tasks import sync_youtube_data
            task = sync_youtube_data.delay(str(account.id))
        else:
            return Response({'error': f'Sync not supported for {account.platform}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'message': f'Sync triggered for {account.platform} account',
            'task_id': task.id
        })
    
    @action(detail=True, methods=['post'])
    def disconnect(self, request, pk=None):
        """Disconnect social media account"""
        account = self.get_object()
        
        # Check permission
        if request.user.role == 'client':
            try:
                client = request.user.client_profile
                if account.client != client:
                    return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            except Client.DoesNotExist:
                return Response({'error': 'Client profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Soft delete - preserve historical data
        account.is_active = False
        account.save()
        
        return Response({'message': f'{account.platform} account disconnected'})

# Add serializers to serializers.py
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

# Update views.py to include the real-time metrics endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_realtime_metrics(request):
    """Get real-time metrics for connected accounts"""
    if request.user.role == 'client':
        try:
            client = request.user.client_profile
            accounts = SocialMediaAccount.objects.filter(client=client, is_active=True)
        except Client.DoesNotExist:
            return Response({'error': 'Client profile not found'}, status=status.HTTP_404_NOT_FOUND)
    else:
        # Admin can see all accounts
        accounts = SocialMediaAccount.objects.filter(is_active=True)
    
    metrics_data = []
    for account in accounts:
        # Get latest metrics for each account
        latest_metrics = RealTimeMetrics.objects.filter(
            account=account
        ).order_by('-date').first()
        
        if latest_metrics:
            metrics_data.append({
                'account': {
                    'id': str(account.id),
                    'platform': account.platform,
                    'username': account.username
                },
                'followers_count': latest_metrics.followers_count,
                'engagement_rate': float(latest_metrics.engagement_rate),
                'reach': latest_metrics.reach,
                'daily_growth': latest_metrics.daily_growth,
                'last_updated': latest_metrics.created_at
            })
    
    return Response({'data': metrics_data})

# Update get_connected_accounts view in oauth_views.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_connected_accounts(request):
    """Get all connected social media accounts for current user"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can view social accounts'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        try:
            client = request.user.client_profile
        except Client.DoesNotExist:
            return Response({'error': 'Client profile not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        accounts = SocialMediaAccount.objects.filter(client=client)
        serializer = SocialMediaAccountSerializer(accounts, many=True)
        
        return Response({
            'accounts': serializer.data,
            'total_count': len(serializer.data)
        })
        
    except Exception as e:
        logger.error(f"Failed to get connected accounts: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Add better error handling and create client profile if missing
def create_client_profile_if_missing(user):
    """Create client profile if it doesn't exist"""
    if user.role == 'client':
        try:
            return user.client_profile
        except Client.DoesNotExist:
            # Create a basic client profile
            client = Client.objects.create(
                user=user,
                name=user.get_full_name() or user.username,
                email=user.email,
                company=user.company or 'Personal',
                package='Basic Package',
                monthly_fee=99.00,
                start_date=timezone.now().date(),
                account_manager='Admin Team',
                next_payment=timezone.now().date() + timedelta(days=30)
            )
            return client
    return None

# Update client dashboard stats view with better error handling
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_dashboard_stats_view(request):
    """Get dashboard statistics for client users"""
    if request.user.role != 'client':
        return Response({'error': 'Client access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        client = create_client_profile_if_missing(request.user)
        if not client:
            return Response({'error': 'Client profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error getting client profile: {str(e)}")
        return Response({'error': 'Failed to get client profile'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    try:
        # Get latest performance data
        latest_performance = PerformanceData.objects.filter(
            client=client
        ).order_by('-month').first()
        
        # Get connected accounts metrics
        connected_accounts = SocialMediaAccount.objects.filter(client=client, is_active=True)
        total_followers = 0
        avg_engagement = 0
        total_reach = 0
        
        if connected_accounts.exists():
            latest_metrics = RealTimeMetrics.objects.filter(
                account__in=connected_accounts
            ).order_by('account', '-date').distinct('account')
            
            total_followers = sum(metric.followers_count for metric in latest_metrics)
            if latest_metrics:
                avg_engagement = sum(float(metric.engagement_rate) for metric in latest_metrics) / len(latest_metrics)
            total_reach = sum(metric.reach for metric in latest_metrics)
        
        # Posts this month
        current_month = timezone.now().replace(day=1)
        posts_this_month = ContentPost.objects.filter(
            client=client,
            created_at__gte=current_month
        ).count()
        
        # Growth rate calculation
        performance_data = PerformanceData.objects.filter(
            client=client
        ).order_by('-month')[:2]
        
        growth_rate = 0
        if len(performance_data) >= 2:
            current = performance_data[0]
            previous = performance_data[1]
            if previous.followers > 0:
                growth_rate = ((current.followers - previous.followers) / previous.followers) * 100
        elif connected_accounts.exists() and latest_performance:
            # Use connected accounts data vs last performance data
            if latest_performance.followers > 0:
                growth_rate = ((total_followers - latest_performance.followers) / latest_performance.followers) * 100
        
        stats_data = {
            'total_followers': total_followers or (latest_performance.followers if latest_performance else 0),
            'engagement_rate': avg_engagement or (latest_performance.engagement if latest_performance else 0),
            'posts_this_month': posts_this_month,
            'reach': total_reach or (latest_performance.reach if latest_performance else 0),
            'growth_rate': growth_rate,
            'next_payment_amount': client.monthly_fee,
            'next_payment_date': client.next_payment
        }
        
        serializer = ClientDashboardStatsSerializer(stats_data)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error calculating client dashboard stats: {str(e)}")
        return Response({'error': 'Failed to calculate statistics'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Add URL for real-time metrics to urls.py
urlpatterns = [
    # ... existing URLs ...
    
    # Real-time metrics endpoint
    path('metrics/realtime/', get_realtime_metrics, name='realtime_metrics'),
    
    # ... rest of URLs ...
]

# Create a comprehensive dashboard management system
class DashboardManager:
    """Centralized dashboard data management"""
    
    @staticmethod
    def get_admin_stats():
        """Get admin dashboard statistics"""
        current_month = timezone.now().replace(day=1)
        
        return {
            'total_revenue': Invoice.objects.filter(
                status='paid',
                paid_at__gte=current_month
            ).aggregate(Sum('amount'))['amount__sum'] or 0,
            
            'active_clients': Client.objects.filter(status='active').count(),
            
            'pending_tasks': Task.objects.filter(
                status__in=['pending', 'in-progress']
            ).count(),
            
            'overdue_payments': Invoice.objects.filter(status='overdue').count(),
            
            'total_followers_delivered': RealTimeMetrics.objects.filter(
                date=timezone.now().date()
            ).aggregate(Sum('followers_count'))['followers_count__sum'] or 0,
            
            'monthly_growth_rate': DashboardManager._calculate_monthly_growth_rate()
        }
    
    @staticmethod
    def get_client_stats(client):
        """Get client dashboard statistics"""
        # Get real-time data from connected accounts
        connected_accounts = SocialMediaAccount.objects.filter(client=client, is_active=True)
        
        if connected_accounts.exists():
            # Use real-time data
            latest_metrics = RealTimeMetrics.objects.filter(
                account__in=connected_accounts,
                date=timezone.now().date()
            )
            
            total_followers = sum(metric.followers_count for metric in latest_metrics)
            avg_engagement = sum(float(metric.engagement_rate) for metric in latest_metrics) / len(latest_metrics) if latest_metrics else 0
            total_reach = sum(metric.reach for metric in latest_metrics)
            
            # Calculate growth rate from daily growth
            daily_growth = sum(metric.daily_growth for metric in latest_metrics)
            growth_rate = (daily_growth / total_followers) * 100 if total_followers > 0 else 0
        else:
            # Fallback to performance data
            latest_performance = PerformanceData.objects.filter(
                client=client
            ).order_by('-month').first()
            
            total_followers = latest_performance.followers if latest_performance else 0
            avg_engagement = latest_performance.engagement if latest_performance else 0
            total_reach = latest_performance.reach if latest_performance else 0
            growth_rate = latest_performance.growth_rate if latest_performance else 0
        
        # Posts this month
        current_month = timezone.now().replace(day=1)
        posts_this_month = ContentPost.objects.filter(
            client=client,
            created_at__gte=current_month
        ).count()
        
        return {
            'total_followers': total_followers,
            'engagement_rate': avg_engagement,
            'posts_this_month': posts_this_month,
            'reach': total_reach,
            'growth_rate': growth_rate,
            'next_payment_amount': client.monthly_fee,
            'next_payment_date': client.next_payment
        }
    
    @staticmethod
    def _calculate_monthly_growth_rate():
        """Calculate monthly growth rate across all clients"""
        current_month = timezone.now().date().replace(day=1)
        previous_month = (current_month - timedelta(days=1)).replace(day=1)
        
        current_total = PerformanceData.objects.filter(
            month=current_month
        ).aggregate(Sum('followers'))['followers__sum'] or 0
        
        previous_total = PerformanceData.objects.filter(
            month=previous_month
        ).aggregate(Sum('followers'))['followers__sum'] or 0
        
        if previous_total > 0:
            return ((current_total - previous_total) / previous_total) * 100
        return 0

# Update the main dashboard views to use DashboardManager
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats_view(request):
    """Get dashboard statistics for admin users"""
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        stats_data = DashboardManager.get_admin_stats()
        serializer = DashboardStatsSerializer(stats_data)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error getting admin dashboard stats: {str(e)}")
        return Response({'error': 'Failed to get dashboard statistics'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  
def client_dashboard_stats_view_updated(request):
    """Updated client dashboard stats view"""
    if request.user.role != 'client':
        return Response({'error': 'Client access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        client = create_client_profile_if_missing(request.user)
        if not client:
            return Response({'error': 'Client profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        stats_data = DashboardManager.get_client_stats(client)
        serializer = ClientDashboardStatsSerializer(stats_data)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error getting client dashboard stats: {str(e)}")
        return Response({'error': 'Failed to get dashboard statistics'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Add comprehensive error handling to OAuth views
from django.conf import settings

def handle_oauth_error(platform, error, user_id=None):
    """Centralized OAuth error handling"""
    logger.error(f"OAuth error for {platform}: {str(error)}")
    
    if user_id:
        # Create notification for user about failed connection
        try:
            user = User.objects.get(id=user_id)
            Notification.objects.create(
                user=user,
                title=f"Failed to connect {platform.title()}",
                message=f"There was an error connecting your {platform} account. Please try again.",
                notification_type='message_received'
            )
        except User.DoesNotExist:
            pass
    
    return {
        'error': f'Failed to connect {platform} account',
        'details': str(error) if settings.DEBUG else 'Please try again or contact support'
    }

# Create task for updating client monthly performance automatically
@shared_task(bind=True, max_retries=2)
def update_all_monthly_performance(self):
    """Update monthly performance for all clients"""
    try:
        clients = Client.objects.filter(status='active')
        updated_count = 0
        
        for client in clients:
            try:
                update_client_monthly_performance.delay(str(client.id))
                updated_count += 1
            except Exception as e:
                logger.error(f"Failed to queue performance update for client {client.id}: {str(e)}")
        
        logger.info(f"Queued monthly performance updates for {updated_count} clients")
        return {'status': 'success', 'clients_updated': updated_count}
        
    except Exception as exc:
        logger.error(f"Failed to update all monthly performance: {str(exc)}")
        raise self.retry(exc=exc, countdown=300)

# Add to settings.py CELERY_BEAT_SCHEDULE
"""
'update-all-monthly-performance': {
    'task': 'api.tasks.update_all_monthly_performance',
    'schedule': crontab(minute=30, hour=1),  # Daily at 1:30 AM
},
"""



# ViewSets for CRUD operations
class ClientViewSet(ModelViewSet):
    """Client management viewset"""
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Client.objects.all()
        else:
            # Clients can only see their own profile
            return Client.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Only admins can create clients
        if self.request.user.role != 'admin':
            raise PermissionError('Admin access required')
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def update_payment_status(self, request, pk=None):
        """Update client payment status"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        client = self.get_object()
        new_status = request.data.get('payment_status')
        
        if new_status in ['paid', 'overdue', 'pending']:
            client.payment_status = new_status
            if new_status == 'paid':
                # Update next payment date
                client.next_payment = timezone.now().date() + timedelta(days=30)
            client.save()
            
            return Response({'message': 'Payment status updated'})
        else:
            return Response({'error': 'Invalid payment status'}, status=status.HTTP_400_BAD_REQUEST)

class TaskViewSet(ModelViewSet):
    """Task management viewset"""
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Task.objects.all()
        else:
            # Clients can only see tasks for their account
            try:
                client = self.request.user.client_profile
                return Task.objects.filter(client=client)
            except Client.DoesNotExist:
                return Task.objects.none()
    
    def perform_create(self, serializer):
        # Only admins can create tasks
        if self.request.user.role != 'admin':
            raise PermissionError('Admin access required')
        serializer.save()
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update tasks"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = BulkTaskUpdateSerializer(data=request.data)
        if serializer.is_valid():
            task_ids = serializer.validated_data['task_ids']
            update_data = {k: v for k, v in serializer.validated_data.items() if k != 'task_ids' and v is not None}
            
            updated_count = Task.objects.filter(id__in=task_ids).update(**update_data)
            return Response({'message': f'{updated_count} tasks updated'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContentPostViewSet(ModelViewSet):
    """Content management viewset"""
    serializer_class = ContentPostSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return ContentPost.objects.all()
        else:
            # Clients can only see their own content
            try:
                client = self.request.user.client_profile
                return ContentPost.objects.filter(client=client)
            except Client.DoesNotExist:
                return ContentPost.objects.none()
    
    def perform_create(self, serializer):
        # Both admins and clients can create content
        if self.request.user.role == 'client':
            try:
                client = self.request.user.client_profile
                serializer.save(client=client, status='pending-approval')
            except Client.DoesNotExist:
                raise PermissionError('Client profile not found')
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve content post"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        content = self.get_object()
        content.status = 'approved'
        content.approved_by = request.user
        content.approved_at = timezone.now()
        content.save()
        
        return Response({'message': 'Content approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject content post"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        content = self.get_object()
        content.status = 'draft'
        content.save()
        
        return Response({'message': 'Content rejected'})
    
    @action(detail=False, methods=['post'])
    def bulk_approve(self, request):
        """Bulk approve/reject content"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = BulkContentApprovalSerializer(data=request.data)
        if serializer.is_valid():
            content_ids = serializer.validated_data['content_ids']
            action = serializer.validated_data['action']
            
            if action == 'approve':
                updated_count = ContentPost.objects.filter(id__in=content_ids).update(
                    status='approved',
                    approved_by=request.user,
                    approved_at=timezone.now()
                )
            else:
                updated_count = ContentPost.objects.filter(id__in=content_ids).update(
                    status='draft'
                )
            
            return Response({'message': f'{updated_count} content items {action}d'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PerformanceDataViewSet(ModelViewSet):
    """Performance data management viewset"""
    serializer_class = PerformanceDataSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = PerformanceData.objects.all()
        
        if self.request.user.role == 'client':
            try:
                client = self.request.user.client_profile
                queryset = queryset.filter(client=client)
            except Client.DoesNotExist:
                return PerformanceData.objects.none()
        
        # Filter by client_id if provided
        client_id = self.request.query_params.get('client_id')
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        return queryset.order_by('-month')
    
    def perform_create(self, serializer):
        # Only admins can create performance data
        if self.request.user.role != 'admin':
            raise PermissionError('Admin access required')
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def monthly_report(self, request):
        """Get monthly performance report"""
        month = request.query_params.get('month')
        if not month:
            month = timezone.now().strftime('%Y-%m')
        
        try:
            month_date = datetime.strptime(month, '%Y-%m').date()
        except ValueError:
            return Response({'error': 'Invalid month format. Use YYYY-MM'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(month=month_date)
        
        # Calculate totals
        totals = queryset.aggregate(
            total_followers=Sum('followers'),
            avg_engagement=Avg('engagement'),
            total_reach=Sum('reach'),
            total_clicks=Sum('clicks'),
            avg_growth_rate=Avg('growth_rate')
        )
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'data': serializer.data,
            'totals': totals,
            'month': month
        })

class MessageViewSet(ModelViewSet):
    """Message management viewset"""
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Message.objects.filter(
            Q(sender=self.request.user) | Q(receiver=self.request.user)
        ).order_by('-timestamp')
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark message as read"""
        message = self.get_object()
        if message.receiver == request.user:
            message.read = True
            message.save()
            return Response({'message': 'Message marked as read'})
        else:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'])
    def conversations(self, request):
        """Get conversation list"""
        # Get unique conversation partners
        conversations = Message.objects.filter(
            Q(sender=request.user) | Q(receiver=request.user)
        ).values(
            'sender', 'receiver', 'sender__first_name', 'sender__last_name',
            'receiver__first_name', 'receiver__last_name'
        ).distinct()
        
        # Process conversations to get unique partners
        partners = set()
        for conv in conversations:
            if conv['sender'] != request.user.id:
                partners.add((conv['sender'], f"{conv['sender__first_name']} {conv['sender__last_name']}"))
            if conv['receiver'] != request.user.id:
                partners.add((conv['receiver'], f"{conv['receiver__first_name']} {conv['receiver__last_name']}"))
        
        return Response([{'id': p[0], 'name': p[1]} for p in partners])

class InvoiceViewSet(ModelViewSet):
    """Invoice management viewset"""
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Invoice.objects.all()
        else:
            # Clients can only see their own invoices
            try:
                client = self.request.user.client_profile
                return Invoice.objects.filter(client=client)
            except Client.DoesNotExist:
                return Invoice.objects.none()
    
    def perform_create(self, serializer):
        # Only admins can create invoices
        if self.request.user.role != 'admin':
            raise PermissionError('Admin access required')
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark invoice as paid"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        invoice = self.get_object()
        invoice.status = 'paid'
        invoice.paid_at = timezone.now()
        invoice.save()
        
        # Update client's total spent and payment status
        client = invoice.client
        client.total_spent += invoice.amount
        client.payment_status = 'paid'
        client.next_payment = timezone.now().date() + timedelta(days=30)
        client.save()
        
        return Response({'message': 'Invoice marked as paid'})

class FileViewSet(ModelViewSet):
    """File management viewset"""
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return File.objects.all()
        else:
            # Clients can only see their own files
            try:
                client = self.request.user.client_profile
                return File.objects.filter(client=client)
            except Client.DoesNotExist:
                return File.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return FileUploadSerializer
        return FileSerializer

class NotificationViewSet(ModelViewSet):
    """Notification management viewset"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        updated_count = self.get_queryset().update(read=True)
        return Response({'message': f'{updated_count} notifications marked as read'})

# Analytics and Reporting Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_overview(request):
    """Get analytics overview"""
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    # Date range
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=90)  # Last 3 months
    
    # Client growth
    client_growth = []
    current_date = start_date
    while current_date <= end_date:
        count = Client.objects.filter(created_at__date__lte=current_date).count()
        client_growth.append({
            'date': current_date,
            'count': count
        })
        current_date += timedelta(days=7)  # Weekly data points
    
    # Revenue trends
    revenue_data = Invoice.objects.filter(
        status='paid',
        paid_at__date__gte=start_date
    ).extra(
        select={'month': 'DATE_TRUNC(\'month\', paid_at)'}
    ).values('month').annotate(
        total=Sum('amount')
    ).order_by('month')
    
    # Task completion rates
    task_stats = Task.objects.aggregate(
        total=Count('id'),
        completed=Count('id', filter=Q(status='completed')),
        pending=Count('id', filter=Q(status='pending')),
        in_progress=Count('id', filter=Q(status='in-progress'))
    )
    
    completion_rate = 0
    if task_stats['total'] > 0:
        completion_rate = (task_stats['completed'] / task_stats['total']) * 100
    
    return Response({
        'client_growth': client_growth,
        'revenue_trends': list(revenue_data),
        'task_stats': task_stats,
        'completion_rate': completion_rate
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_performance_report(request, client_id):
    """Generate client performance report"""
    try:
        client = Client.objects.get(id=client_id)
    except Client.DoesNotExist:
        return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check permissions
    if request.user.role == 'client' and request.user.client_profile != client:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get performance data for last 6 months
    end_date = timezone.now().date()
    start_date = end_date.replace(day=1) - timedelta(days=180)
    
    performance_data = PerformanceData.objects.filter(
        client=client,
        month__gte=start_date
    ).order_by('month')
    
    # Calculate summary metrics
    if performance_data.exists():
        latest = performance_data.last()
        first = performance_data.first()
        
        follower_growth = latest.followers - first.followers if first.followers > 0 else 0
        avg_engagement = performance_data.aggregate(Avg('engagement'))['engagement__avg'] or 0
        total_reach = performance_data.aggregate(Sum('reach'))['reach__sum'] or 0
        
        summary = {
            'follower_growth': follower_growth,
            'avg_engagement': round(avg_engagement, 2),
            'total_reach': total_reach,
            'current_followers': latest.followers
        }
    else:
        summary = {
            'follower_growth': 0,
            'avg_engagement': 0,
            'total_reach': 0,
            'current_followers': 0
        }
    
    # Content performance
    content_stats = ContentPost.objects.filter(client=client).aggregate(
        total_posts=Count('id'),
        approved_posts=Count('id', filter=Q(status='approved')),
        posted_content=Count('id', filter=Q(status='posted'))
    )
    
    serializer = PerformanceDataSerializer(performance_data, many=True)
    
    return Response({
        'client_name': client.name,
        'period': f"{start_date} to {end_date}",
        'performance_data': serializer.data,
        'summary': summary,
        'content_stats': content_stats
    })

# Health check endpoint
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """API health check"""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now(),
        'version': '1.0.0'
    })