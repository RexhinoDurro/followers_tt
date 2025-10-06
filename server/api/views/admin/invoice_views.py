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

# NEW: Import the NotificationService
from ...services.notification_service import NotificationService

logger = logging.getLogger(__name__)

from ...models import (
    User, Client, Task, ContentPost, PerformanceData,
    Message, Invoice, TeamMember, Project, File, Notification,
    SocialMediaAccount, RealTimeMetrics
)

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
        
        invoice = serializer.save()
        
        # 🔔 NEW: Notify client of new invoice
        NotificationService.notify_invoice_created(
            client_user=invoice.client.user,
            invoice=invoice
        )
    
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
        
        # 🔔 NEW: Notify client that payment was received
        NotificationService.notify_payment_received(
            client_user=client.user,
            invoice=invoice
        )
        
        return Response({'message': 'Invoice marked as paid'})