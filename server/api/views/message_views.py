# server/api/views/message_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from ..models import User, Client, Message
from ..serializers import MessageSerializer

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
        
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
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
        
        message = Message.objects.create(
            sender=request.user,
            receiver=client_user,
            content=content
        )
        
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_conversations(request):
    """Get all client conversations for admin"""
    try:
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Get all clients with their latest message
        clients = Client.objects.all()
        conversations = []
        
        for client in clients:
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
            
            conversations.append({
                'id': str(client.id),
                'user_id': str(client.user.id),
                'name': client.name,
                'company': client.company,
                'email': client.email,
                'role': 'client',
                'lastMessage': MessageSerializer(latest_message).data if latest_message else None,
                'unreadCount': unread_count
            })
        
        return Response({'conversations': conversations})
        
    except Exception as e:
        return Response({'error': str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation_messages(request, user_id):
    """Get messages between current user and specified user"""
    try:
        # Get messages between the two users
        messages = Message.objects.filter(
            Q(sender=request.user, receiver_id=user_id) |
            Q(sender_id=user_id, receiver=request.user)
        ).order_by('timestamp')
        
        # Mark messages as read
        Message.objects.filter(
            sender_id=user_id,
            receiver=request.user,
            read=False
        ).update(read=True)
        
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)