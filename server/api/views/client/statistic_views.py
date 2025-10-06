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

# Import serializers from the correct location
from ...serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    ClientSerializer, TaskSerializer, ContentPostSerializer,
    PerformanceDataSerializer, MessageSerializer, InvoiceSerializer,
    TeamMemberSerializer, ProjectSerializer, FileSerializer,
    NotificationSerializer, DashboardStatsSerializer,
    ClientDashboardStatsSerializer, BulkTaskUpdateSerializer,
    BulkContentApprovalSerializer, FileUploadSerializer,
    SocialMediaAccountSerializer, RealTimeMetricsSerializer
)

logger = logging.getLogger(__name__)

from ...models import (
    User, Client, Task, ContentPost, PerformanceData,
    Message, Invoice, TeamMember, Project, File, Notification,
    SocialMediaAccount, RealTimeMetrics
)

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
    """Get dashboard statistics for client users - UPDATED FOR REAL-TIME DATA"""
    if request.user.role != 'client':
        return Response({'error': 'Client access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        client = request.user.client_profile
    except Client.DoesNotExist:
        return Response({'error': 'Client profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Import the aggregation service
    from ...services.metrics_aggregation_service import MetricsAggregationService
    
    # Get REAL-TIME stats (not monthly aggregation)
    stats = MetricsAggregationService.get_client_real_time_stats(client)
    
    # Add payment info
    stats['next_payment_amount'] = float(client.monthly_fee)
    stats['next_payment_date'] = client.next_payment
    
    logger.info(f"Client dashboard stats for {client.name}: {stats}")
    
    serializer = ClientDashboardStatsSerializer(stats)
    return Response(serializer.data)

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
    
    # Revenue trends (SQLite/Postgres compatible)
    from django.db import connection
    if connection.vendor == 'sqlite':
        revenue_data = Invoice.objects.filter(
            status='paid',
            paid_at__date__gte=start_date
        ).extra(
            select={'month': 
                "date(paid_at, 'start of month')"  # SQLite-compatible date formatting
            }
        ).values('month').annotate(
            total=Sum('amount')
        ).order_by('month')
    else:
        from django.db.models.functions import TruncMonth
        revenue_data = Invoice.objects.filter(
            status='paid',
            paid_at__date__gte=start_date
        ).annotate(
            month=TruncMonth('paid_at')
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
