# server/api/views/client/content_views.py - Complete rewrite

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from django.db.models import Q
import logging

from ...models import ContentPost, ContentImage, Client, SocialMediaAccount
from ...serializers import ContentPostSerializer, ContentImageSerializer

logger = logging.getLogger(__name__)


class ContentPostViewSet(ModelViewSet):
    """Content management viewset - FIXED"""
    serializer_class = ContentPostSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        queryset = ContentPost.objects.all()
        
        if self.request.user.role == 'admin':
            # Admin sees all content
            pass
        else:
            # Clients only see their own content
            try:
                client = self.request.user.client_profile
                queryset = queryset.filter(client=client)
            except Client.DoesNotExist:
                return ContentPost.objects.none()
        
        # Filter by platform if specified
        platform = self.request.query_params.get('platform')
        if platform:
            queryset = queryset.filter(platform=platform)
        
        # Filter by social account if specified
        social_account_id = self.request.query_params.get('social_account')
        if social_account_id:
            queryset = queryset.filter(social_account_id=social_account_id)
        
        # Filter by status if specified
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(scheduled_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(scheduled_date__lte=end_date)
        
        return queryset.select_related('client', 'social_account', 'approved_by').prefetch_related('images').order_by('-scheduled_date')
    
    def create(self, request, *args, **kwargs):
        """Create content post - FIXED"""
        try:
            logger.info(f"Content creation request from {request.user.email}")
            logger.info(f"Request data: {request.data}")
            
            # Get the client
            if request.user.role == 'client':
                try:
                    client = request.user.client_profile
                except Client.DoesNotExist:
                    return Response(
                        {'error': 'Client profile not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                # Admin can specify client
                client_id = request.data.get('client')
                if not client_id:
                    return Response(
                        {'error': 'Client ID is required'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                try:
                    client = Client.objects.get(id=client_id)
                except Client.DoesNotExist:
                    return Response(
                        {'error': 'Client not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Prepare data
            data = request.data.copy()
            
            # Handle uploaded images
            uploaded_images = []
            image_files = request.FILES.getlist('images')
            if image_files:
                uploaded_images = image_files
                logger.info(f"Received {len(uploaded_images)} images")
            
            # Create content post
            content_data = {
                'platform': data.get('platform'),
                'title': data.get('title', ''),
                'content': data.get('content', ''),
                'scheduled_date': data.get('scheduled_date'),
                'admin_message': data.get('admin_message', ''),
                'social_account': data.get('social_account') if data.get('social_account') else None,
            }
            
            # Set status based on user role
            if request.user.role == 'client':
                content_data['status'] = 'pending-approval'
            else:
                content_data['status'] = data.get('status', 'approved')
            
            # Create the post
            content_post = ContentPost.objects.create(
                client=client,
                **content_data
            )
            
            # Save images
            for i, image_file in enumerate(uploaded_images):
                ContentImage.objects.create(
                    content_post=content_post,
                    image=image_file,
                    order=i
                )
            
            logger.info(f"Content post created: {content_post.id}")
            
            # Return serialized data
            serializer = self.get_serializer(content_post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Content creation error: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
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
        
        serializer = self.get_serializer(content)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject content post"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        content = self.get_object()
        content.status = 'draft'
        content.save()
        
        serializer = self.get_serializer(content)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_posted(self, request, pk=None):
        """Mark content as posted and add post URL"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        content = self.get_object()
        post_url = request.data.get('post_url')
        
        if not post_url:
            return Response(
                {'error': 'Post URL is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        content.status = 'posted'
        content.post_url = post_url
        content.posted_at = timezone.now()
        
        # Optionally update engagement metrics
        content.likes = request.data.get('likes', 0)
        content.comments = request.data.get('comments', 0)
        content.shares = request.data.get('shares', 0)
        content.views = request.data.get('views', 0)
        
        content.save()
        
        serializer = self.get_serializer(content)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_platform(self, request):
        """Get content grouped by platform"""
        queryset = self.filter_queryset(self.get_queryset())
        
        platform = request.query_params.get('platform')
        if not platform:
            return Response(
                {'error': 'Platform parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        content = queryset.filter(platform=platform)
        serializer = self.get_serializer(content, many=True)
        
        return Response({
            'platform': platform,
            'count': content.count(),
            'content': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def calendar_view(self, request):
        """Get content in calendar format"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Group by date
        from collections import defaultdict
        calendar_data = defaultdict(list)
        
        for post in queryset:
            date_key = post.scheduled_date.strftime('%Y-%m-%d')
            calendar_data[date_key].append(self.get_serializer(post).data)
        
        return Response(dict(calendar_data))