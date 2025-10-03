# ViewSets for CRUD operations
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



