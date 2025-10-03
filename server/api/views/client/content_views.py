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