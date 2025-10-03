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

# Social Media Account ViewSet
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
        
        # Trigger sync task (import here to avoid circular imports)
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

# Real-time metrics endpoint
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
