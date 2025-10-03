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