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