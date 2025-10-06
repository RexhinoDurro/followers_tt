# server/api/views/message_views.py - Complete Fixed Version
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.utils import timezone
import logging

from ..models import User, Client, Message
from ..serializers import MessageSerializer
from ..services.notification_service import NotificationService  # NEW IMPORT

logger = logging.getLogger(__name__)

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
from ..serializers import (
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

from ..models import (
    User, Client, Task, ContentPost, PerformanceData,
    Message, Invoice, TeamMember, Project, File, Notification,
    SocialMediaAccount, RealTimeMetrics
)


class MessageViewSet(ModelViewSet):
    """Message management viewset"""
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Message.objects.filter(
            Q(sender=self.request.user) | Q(receiver=self.request.user)
        ).order_by('-timestamp')
    
    def perform_create(self, serializer):
        message = serializer.save(sender=self.request.user)
        
        # 🔔 NEW: Notify recipient of new message
        sender_name = f"{self.request.user.first_name} {self.request.user.last_name}" if self.request.user.first_name else self.request.user.email
        NotificationService.notify_message_received(
            recipient_user=message.receiver,
            sender_name=sender_name
        )
    
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
    
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message_to_admin(request):
    """Send message from client to admin"""
    try:
        content = request.data.get('content')
        if not content:
            return Response({'error': 'Message content is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Find an admin user to send to
        admin_user = User.objects.filter(role='admin').first()
        if not admin_user:
            return Response({'error': 'No admin user found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        message = Message.objects.create(
            sender=request.user,
            receiver=admin_user,
            content=content
        )
        
        # 🔔 NEW: Notify admin of new message
        sender_name = f"{request.user.first_name} {request.user.last_name}" if request.user.first_name else request.user.email
        NotificationService.notify_message_to_admin(sender_name)
        
        logger.info(f"Message sent from {request.user.username} to admin {admin_user.username}")
        
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error sending message to admin: {str(e)}")
        return Response({'error': str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message_to_client(request):
    """Send message from admin to client"""
    try:
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client_id = request.data.get('client_id')
        content = request.data.get('content')
        
        if not content or not client_id:
            return Response({'error': 'Client ID and message content are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Find the client's user
        try:
            client = Client.objects.get(id=client_id)
            client_user = client.user
            
        except Client.DoesNotExist:
            return Response({'error': 'Client not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Create the message
        message = Message.objects.create(
            sender=request.user,
            receiver=client_user,
            content=content
        )
        
        # 🔔 NEW: Notify client of new message
        sender_name = f"{request.user.first_name} {request.user.last_name}" if request.user.first_name else "Admin"
        NotificationService.notify_message_received(
            recipient_user=client_user,
            sender_name=sender_name
        )
        
        logger.info(f"Message created successfully with ID: {message.id}")
        
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error sending message to client: {str(e)}")
        return Response({'error': str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_conversations(request):
    """Get all client conversations for admin with proper user IDs"""
    try:
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        logger.info(f"Admin {request.user.username} fetching conversations")
        
        # Get all clients with their user accounts
        clients = Client.objects.select_related('user').all()
        conversations = []
        
        for client in clients:
            # Skip clients without user accounts
            if not client.user:
                logger.warning(f"Client {client.name} has no user account")
                continue
            
            # Get latest message with this client
            latest_message = Message.objects.filter(
                Q(sender=request.user, receiver=client.user) |
                Q(sender=client.user, receiver=request.user)
            ).order_by('-timestamp').first()
            
            # Count unread messages from this client
            unread_count = Message.objects.filter(
                sender=client.user,
                receiver=request.user,
                read=False
            ).count()
            
            conversation_data = {
                'id': str(client.id),
                'clientId': str(client.id),
                'userId': str(client.user.id),  # Include the actual user ID
                'user_id': str(client.user.id),  # Alternative field name
                'name': f"{client.user.first_name} {client.user.last_name}" if client.user.first_name else client.name,
                'company': client.company,
                'email': client.user.email,
                'role': 'client',
                'lastMessage': MessageSerializer(latest_message).data if latest_message else None,
                'unreadCount': unread_count
            }
            
            # Add user avatar if available
            if hasattr(client.user, 'avatar') and client.user.avatar:
                conversation_data['avatar'] = client.user.avatar.url
            
            conversations.append(conversation_data)
        
        logger.info(f"Found {len(conversations)} conversations")
        
        return Response({'conversations': conversations})
        
    except Exception as e:
        logger.error(f"Error fetching admin conversations: {str(e)}")
        return Response({'error': str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation_messages(request, user_id):
    """Get messages between current user and specified user"""
    try:
        logger.info(f"User {request.user.username} fetching messages with user {user_id}")
        
        # Verify the user exists
        try:
            other_user = User.objects.get(id=user_id)
            logger.info(f"Found other user: {other_user.username}")
        except User.DoesNotExist:
            logger.error(f"User not found with ID: {user_id}")
            return Response({'error': 'User not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Get messages between the two users
        messages = Message.objects.filter(
            Q(sender=request.user, receiver_id=user_id) |
            Q(sender_id=user_id, receiver=request.user)
        ).order_by('timestamp')
        
        logger.info(f"Found {messages.count()} messages")
        
        # Mark messages from the other user as read
        unread_messages = messages.filter(
            sender_id=user_id,
            receiver=request.user,
            read=False
        )
        
        unread_count = unread_messages.count()
        if unread_count > 0:
            unread_messages.update(read=True)
            logger.info(f"Marked {unread_count} messages as read")
        
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error fetching conversation messages: {str(e)}")
        return Response({'error': str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)