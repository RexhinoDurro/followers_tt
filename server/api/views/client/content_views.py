# server/api/views/client/content_views.py - Complete with Admin Features

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
import logging
import json
import zipfile
import io

from ...models import ContentPost, ContentImage, Client, SocialMediaAccount
from ...serializers import ContentPostSerializer, ContentImageSerializer
from ...services.notification_service import NotificationService

logger = logging.getLogger(__name__)


class ContentPostViewSet(ModelViewSet):
    """Content management viewset - COMPLETE with Admin Features"""
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
        """Create content post - Both Client and Admin"""
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
                # Admin MUST specify client when creating content
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
            
            # Handle social account - fetch the actual instance
            social_account = None
            social_account_id = data.get('social_account')
            if social_account_id:
                try:
                    social_account = SocialMediaAccount.objects.get(id=social_account_id)
                    # Verify it belongs to this client
                    if social_account.client != client:
                        return Response(
                            {'error': 'Social account does not belong to this client'},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except SocialMediaAccount.DoesNotExist:
                    return Response(
                        {'error': 'Social account not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Create content post
            content_data = {
                'platform': data.get('platform'),
                'title': data.get('title', ''),
                'content': data.get('content', ''),
                'scheduled_date': data.get('scheduled_date'),
                'admin_message': data.get('admin_message', ''),
                'social_account': social_account,
            }
            
            # Set status based on user role and intent
            if request.user.role == 'client':
                # Client creates content for admin approval
                content_data['status'] = 'pending-approval'
            else:
                # Admin creates content - check if it needs client approval
                needs_approval = data.get('needs_client_approval', False)
                if needs_approval:
                    content_data['status'] = 'pending-approval'
                else:
                    content_data['status'] = data.get('status', 'approved')
                    # Auto-approve if admin doesn't need client approval
                    if content_data['status'] == 'approved':
                        content_data['approved_by'] = request.user
                        content_data['approved_at'] = timezone.now()
            
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
            
            # 🔔 NEW: Send notifications
            if request.user.role == 'client':
                # Notify admins when client submits content for approval
                NotificationService.notify_content_submitted(content_post)
            
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
    
    def update(self, request, *args, **kwargs):
        """Update content post - Both Client and Admin can edit"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            # Permission check
            if request.user.role == 'client':
                # Clients can only edit their own content
                try:
                    client = request.user.client_profile
                    if instance.client != client:
                        return Response(
                            {'error': 'Permission denied'},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except Client.DoesNotExist:
                    return Response(
                        {'error': 'Client profile not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            # Admin can edit any content
            
            # Handle new images if uploaded
            image_files = request.FILES.getlist('images')
            if image_files:
                # Add new images (don't delete old ones unless specified)
                delete_old = request.data.get('delete_old_images', False)
                if delete_old:
                    instance.images.all().delete()
                
                for i, image_file in enumerate(image_files):
                    ContentImage.objects.create(
                        content_post=instance,
                        image=image_file,
                        order=instance.images.count() + i
                    )
            
            # Handle social account update
            social_account_id = request.data.get('social_account')
            if social_account_id:
                try:
                    social_account = SocialMediaAccount.objects.get(id=social_account_id)
                    if social_account.client != instance.client:
                        return Response(
                            {'error': 'Social account does not belong to this client'},
                            status=status.HTTP_403_FORBIDDEN
                        )
                    instance.social_account = social_account
                except SocialMediaAccount.DoesNotExist:
                    return Response(
                        {'error': 'Social account not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Update other fields
            updateable_fields = ['title', 'content', 'scheduled_date', 'admin_message', 'platform']
            for field in updateable_fields:
                if field in request.data:
                    setattr(instance, field, request.data[field])
            
            # If client edits, reset to pending-approval
            if request.user.role == 'client' and instance.status == 'approved':
                instance.status = 'pending-approval'
                instance.approved_by = None
                instance.approved_at = None
            
            instance.save()
            
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Content update error: {str(e)}", exc_info=True)
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
        
        # 🔔 NEW: Notify client that their content was approved
        NotificationService.notify_content_approved(
            client_user=content.client.user,
            content_post=content
        )
        
        serializer = self.get_serializer(content)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject content post"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        content = self.get_object()
        feedback = request.data.get('feedback', '')
        
        content.status = 'draft'
        if feedback:
            content.admin_message = feedback
        content.save()
        
        # 🔔 NEW: Notify client that their content needs revision
        NotificationService.notify_content_rejected(
            client_user=content.client.user,
            content_post=content,
            feedback=feedback
        )
        
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
        
        # 🔔 NEW: Notify client that their content was posted
        NotificationService.notify_content_posted(
            client_user=content.client.user,
            content_post=content
        )
        
        serializer = self.get_serializer(content)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download post content as JSON with image URLs"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        content = self.get_object()
        
        # Prepare download data
        download_data = {
            'title': content.title,
            'description': content.content,
            'platform': content.platform,
            'scheduled_date': content.scheduled_date.isoformat(),
            'client_name': content.client.name,
            'images': [],
            'admin_message': content.admin_message,
            'social_account': content.social_account.username if content.social_account else None
        }
        
        # Add image URLs
        for img in content.images.all():
            download_data['images'].append({
                'url': request.build_absolute_uri(img.image.url),
                'caption': img.caption,
                'order': img.order
            })
        
        response = JsonResponse(download_data)
        response['Content-Disposition'] = f'attachment; filename="post_{content.id}.json"'
        return response
    
    @action(detail=True, methods=['get'])
    def download_images(self, request, pk=None):
        """Download all post images as a ZIP file"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        content = self.get_object()
        images = content.images.all()
        
        if not images:
            return Response(
                {'error': 'No images to download'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create ZIP file in memory
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Add metadata file
            metadata = {
                'title': content.title,
                'description': content.content,
                'platform': content.platform,
                'scheduled_date': content.scheduled_date.isoformat(),
                'client_name': content.client.name
            }
            zip_file.writestr('post_info.json', json.dumps(metadata, indent=2))
            
            # Add each image
            for i, img in enumerate(images):
                try:
                    img.image.open()
                    image_data = img.image.read()
                    # Get file extension
                    ext = img.image.name.split('.')[-1]
                    filename = f"image_{i+1}.{ext}"
                    zip_file.writestr(filename, image_data)
                except Exception as e:
                    logger.error(f"Error reading image {img.id}: {e}")
        
        # Prepare response
        zip_buffer.seek(0)
        response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="post_{content.id}_images.zip"'
        return response
    
    @action(detail=True, methods=['delete'])
    def delete_image(self, request, pk=None):
        """Delete a specific image from the post"""
        content = self.get_object()
        image_id = request.data.get('image_id')
        
        if not image_id:
            return Response(
                {'error': 'Image ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            image = ContentImage.objects.get(id=image_id, content_post=content)
            image.delete()
            
            serializer = self.get_serializer(content)
            return Response(serializer.data)
        except ContentImage.DoesNotExist:
            return Response(
                {'error': 'Image not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
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
    
    @action(detail=True, methods=['post'])
    def set_draft(self, request, pk=None):
        """Set content back to draft"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        content = self.get_object()
        content.status = 'draft'
        content.approved_by = None
        content.approved_at = None
        content.save()
        
        serializer = self.get_serializer(content)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_mark_posted(self, request):
            """Bulk mark content as posted"""
            if request.user.role != 'admin':
                return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
            
            content_ids = request.data.get('content_ids', [])
            
            if not content_ids:
                return Response(
                    {'error': 'Content IDs are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update all posts to posted status
            content_posts = ContentPost.objects.filter(id__in=content_ids)
            content_posts.update(
                status='posted',
                posted_at=timezone.now()
            )
            
            return Response({
                'message': f'{content_posts.count()} posts marked as posted',
                'count': content_posts.count()
            })
            
    @action(detail=False, methods=['post'])
    def bulk_approve(self, request):
        """Bulk approve content"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        content_ids = request.data.get('content_ids', [])
        action_type = request.data.get('action', 'approve')
        feedback = request.data.get('feedback', '')
        
        if not content_ids:
            return Response(
                {'error': 'Content IDs are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        content_posts = ContentPost.objects.filter(id__in=content_ids).select_related('client__user')
        
        if action_type == 'approve':
            content_posts.update(
                status='approved',
                approved_by=request.user,
                approved_at=timezone.now()
            )
            
            # 🔔 NEW: Notify each client their content was approved
            for content in content_posts:
                NotificationService.notify_content_approved(
                    client_user=content.client.user,
                    content_post=content
                )
            
            message = f'{content_posts.count()} posts approved'
        else:  # reject
            update_data = {'status': 'draft'}
            if feedback:
                update_data['admin_message'] = feedback
            content_posts.update(**update_data)
            
            # 🔔 NEW: Notify each client their content needs revision
            for content in content_posts:
                NotificationService.notify_content_rejected(
                    client_user=content.client.user,
                    content_post=content,
                    feedback=feedback
                )
            
            message = f'{content_posts.count()} posts rejected'
        
        return Response({'message': message, 'count': content_posts.count()})
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Bulk delete content posts"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        content_ids = request.data.get('content_ids', [])
        
        if not content_ids:
            return Response(
                {'error': 'Content IDs are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        content_posts = ContentPost.objects.filter(id__in=content_ids)
        count = content_posts.count()
        
        # Delete associated images first
        for post in content_posts:
            for img in post.images.all():
                if img.image:
                    try:
                        img.image.delete(save=False)
                    except Exception as e:
                        logger.warning(f"Failed to delete image file: {e}")
        
        content_posts.delete()
        
        logger.info(f"Admin {request.user.email} deleted {count} content posts")
        
        return Response({
            'message': f'{count} posts deleted successfully',
            'count': count
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Delete associated images
        for img in instance.images.all():
            if img.image:
                try:
                    img.image.delete(save=False)
                except Exception as e:
                    logger.warning(f"Failed to delete image file: {e}")
        
        post_title = instance.title or instance.id
        self.perform_destroy(instance)
        
        logger.info(f"Admin {request.user.email} deleted content post: {post_title}")
        
        return Response(status=status.HTTP_204_NO_CONTENT)