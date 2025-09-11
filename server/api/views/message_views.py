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

logger = logging.getLogger(__name__)

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
        
        logger.info(f"Admin {request.user.username} sending message to client {client_id}")
        logger.info(f"Message content: {content}")
        
        if not content or not client_id:
            return Response({'error': 'Client ID and message content are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Find the client's user
        try:
            client = Client.objects.get(id=client_id)
            client_user = client.user
            
            logger.info(f"Found client: {client.name} with user: {client_user.username}")
            
        except Client.DoesNotExist:
            logger.error(f"Client not found with ID: {client_id}")
            return Response({'error': 'Client not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Create the message
        message = Message.objects.create(
            sender=request.user,
            receiver=client_user,
            content=content
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