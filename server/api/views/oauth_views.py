# server/api/views/oauth_views.py
from django.http import JsonResponse, HttpResponseRedirect
from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import requests
import secrets
import logging
from datetime import timedelta
from urllib.parse import urlencode

from ..models import SocialMediaAccount, Client
from ..services.instagram_service import InstagramService
from ..services.youtube_service import YouTubeService
from ..tasks import sync_instagram_data, sync_youtube_data

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def initiate_instagram_oauth(request):
    """Initiate Instagram OAuth flow"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can connect social accounts'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Generate state parameter for security
        state = secrets.token_urlsafe(32)
        
        # Store state in session or cache for verification
        request.session[f'oauth_state_instagram'] = state
        
        # Build Instagram OAuth URL
        params = {
            'client_id': settings.INSTAGRAM_CLIENT_ID,
            'redirect_uri': f"{settings.FRONTEND_URL}/auth/instagram/callback",
            'scope': 'instagram_basic,instagram_manage_insights,pages_read_engagement',
            'response_type': 'code',
            'state': state
        }
        
        oauth_url = f"https://api.instagram.com/oauth/authorize?{urlencode(params)}"
        
        return Response({
            'oauth_url': oauth_url,
            'state': state
        })
        
    except Exception as e:
        logger.error(f"Failed to initiate Instagram OAuth: {str(e)}")
        return Response({'error': 'Failed to initiate OAuth'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def handle_instagram_callback(request):
    """Handle Instagram OAuth callback"""
    try:
        code = request.data.get('code')
        state = request.data.get('state')
        
        if not code:
            return Response({'error': 'Authorization code is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Verify state parameter
        stored_state = request.session.get('oauth_state_instagram')
        if not stored_state or stored_state != state:
            return Response({'error': 'Invalid state parameter'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Exchange code for access token
        token_url = "https://api.instagram.com/oauth/access_token"
        token_data = {
            'client_id': settings.INSTAGRAM_CLIENT_ID,
            'client_secret': settings.INSTAGRAM_CLIENT_SECRET,
            'grant_type': 'authorization_code',
            'redirect_uri': f"{settings.FRONTEND_URL}/auth/instagram/callback",
            'code': code
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        token_result = token_response.json()
        
        if 'access_token' not in token_result:
            return Response({'error': 'Failed to get access token'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Get long-lived token
        service = InstagramService(None)
        long_lived_token = service.get_long_lived_token(token_result['access_token'])
        
        # Get user info
        user_info_url = f"https://graph.facebook.com/v18.0/me?fields=id,username&access_token={long_lived_token['access_token']}"
        user_response = requests.get(user_info_url)
        user_response.raise_for_status()
        user_data = user_response.json()
        
        # Save social media account
        client = request.user.client_profile
        
        account, created = SocialMediaAccount.objects.update_or_create(
            client=client,
            platform='instagram',
            account_id=user_data['id'],
            defaults={
                'username': user_data.get('username', 'Unknown'),
                'access_token': long_lived_token['access_token'],  # Will be encrypted in save()
                'token_expires_at': timezone.now() + timedelta(seconds=long_lived_token['expires_in']),
                'is_active': True
            }
        )
        
        # Clean up session
        if 'oauth_state_instagram' in request.session:
            del request.session['oauth_state_instagram']
        
        # Trigger initial data sync
        sync_instagram_data.delay(str(account.id))
        
        return Response({
            'message': 'Instagram account connected successfully',
            'account': {
                'id': str(account.id),
                'platform': account.platform,
                'username': account.username,
                'created': created
            }
        })
        
    except requests.RequestException as e:
        logger.error(f"Instagram OAuth API error: {str(e)}")
        return Response({'error': 'Failed to connect Instagram account'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Instagram OAuth callback error: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def initiate_youtube_oauth(request):
    """Initiate YouTube OAuth flow"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can connect social accounts'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Generate state parameter for security
        state = secrets.token_urlsafe(32)
        
        # Store state in session
        request.session[f'oauth_state_youtube'] = state
        
        # Build Google OAuth URL
        params = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'redirect_uri': settings.YOUTUBE_REDIRECT_URI,
            'scope': 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly',
            'response_type': 'code',
            'access_type': 'offline',
            'prompt': 'consent',
            'state': state
        }
        
        oauth_url = f"https://accounts.google.com/oauth2/auth?{urlencode(params)}"
        
        # Debug log
        logger.info(f"YouTube OAuth URL generated: {oauth_url}")
        logger.info(f"Params: {params}")
        logger.info(f"Settings YOUTUBE_REDIRECT_URI: {settings.YOUTUBE_REDIRECT_URI}")
        
        return Response({
            'oauth_url': oauth_url,
            'state': state
        })
        
    except Exception as e:
        logger.error(f"Failed to initiate YouTube OAuth: {str(e)}")
        return Response({'error': 'Failed to initiate OAuth'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def handle_youtube_callback(request):
    """Handle YouTube OAuth callback"""
    try:
        code = request.data.get('code')
        state = request.data.get('state')
        
        if not code:
            return Response({'error': 'Authorization code is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Verify state parameter
        stored_state = request.session.get('oauth_state_youtube')
        if not stored_state or stored_state != state:
            return Response({'error': 'Invalid state parameter'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': settings.YOUTUBE_REDIRECT_URI,
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        token_result = token_response.json()
        
        if 'access_token' not in token_result:
            return Response({'error': 'Failed to get access token'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Get YouTube channel info
        from googleapiclient.discovery import build
        from google.oauth2.credentials import Credentials
        
        creds = Credentials(
            token=token_result['access_token'],
            refresh_token=token_result.get('refresh_token'),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET
        )
        
        youtube = build('youtube', 'v3', credentials=creds)
        
        # Get channel information
        channels_response = youtube.channels().list(
            part='snippet,statistics',
            mine=True
        ).execute()
        
        if not channels_response.get('items'):
            return Response({'error': 'No YouTube channel found for this account'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        channel_data = channels_response['items'][0]
        channel_id = channel_data['id']
        channel_title = channel_data['snippet']['title']
        
        # Save social media account
        client = request.user.client_profile
        
        # Calculate token expiry
        expires_in = token_result.get('expires_in', 3600)  # Default 1 hour
        token_expires_at = timezone.now() + timedelta(seconds=expires_in)
        
        account, created = SocialMediaAccount.objects.update_or_create(
            client=client,
            platform='youtube',
            account_id=channel_id,
            defaults={
                'username': channel_title,
                'access_token': token_result['access_token'],  # Will be encrypted in save()
                'refresh_token': token_result.get('refresh_token', ''),  # Will be encrypted in save()
                'token_expires_at': token_expires_at,
                'is_active': True
            }
        )
        
        # Clean up session
        if 'oauth_state_youtube' in request.session:
            del request.session['oauth_state_youtube']
        
        # Trigger initial data sync
        sync_youtube_data.delay(str(account.id))
        
        return Response({
            'message': 'YouTube channel connected successfully',
            'account': {
                'id': str(account.id),
                'platform': account.platform,
                'username': account.username,
                'created': created
            }
        })
        
    except requests.RequestException as e:
        logger.error(f"YouTube OAuth API error: {str(e)}")
        return Response({'error': 'Failed to connect YouTube channel'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"YouTube OAuth callback error: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_connected_accounts(request):
    """Get all connected social media accounts for current user"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can view social accounts'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client = request.user.client_profile
        accounts = SocialMediaAccount.objects.filter(client=client)
        
        account_data = []
        for account in accounts:
            # Get latest metrics
            latest_metrics = account.metrics.order_by('-date').first()
            
            account_info = {
                'id': str(account.id),
                'platform': account.platform,
                'username': account.username,
                'is_active': account.is_active,
                'last_sync': account.last_sync,
                'created_at': account.created_at,
                'followers_count': latest_metrics.followers_count if latest_metrics else 0,
                'engagement_rate': float(latest_metrics.engagement_rate) if latest_metrics else 0,
                'posts_count': latest_metrics.posts_count if latest_metrics else 0,
            }
            account_data.append(account_info)
        
        return Response({
            'accounts': account_data,
            'total_count': len(account_data)
        })
        
    except Exception as e:
        logger.error(f"Failed to get connected accounts: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disconnect_account(request, account_id):
    """Disconnect a social media account"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can disconnect social accounts'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        client = request.user.client_profile
        
        try:
            account = SocialMediaAccount.objects.get(
                id=account_id,
                client=client
            )
        except SocialMediaAccount.DoesNotExist:
            return Response({'error': 'Account not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        platform = account.platform
        username = account.username
        
        # Soft delete - mark as inactive instead of deleting to preserve historical data
        account.is_active = False
        account.save()
        
        # Optionally, you could also revoke the token on the platform side here
        # For Instagram/Facebook, you would call their revoke endpoint
        # For Google/YouTube, you would revoke the refresh token
        
        return Response({
            'message': f'{platform.title()} account "{username}" disconnected successfully'
        })
        
    except Exception as e:
        logger.error(f"Failed to disconnect account {account_id}: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trigger_manual_sync(request, account_id):
    """Trigger manual sync for a specific account"""
    try:
        if request.user.role not in ['client', 'admin']:
            return Response({'error': 'Permission denied'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        try:
            if request.user.role == 'client':
                client = request.user.client_profile
                account = SocialMediaAccount.objects.get(
                    id=account_id,
                    client=client,
                    is_active=True
                )
            else:  # admin
                account = SocialMediaAccount.objects.get(
                    id=account_id,
                    is_active=True
                )
        except SocialMediaAccount.DoesNotExist:
            return Response({'error': 'Account not found or inactive'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Check if account was synced recently to prevent abuse
        if account.last_sync and account.last_sync > timezone.now() - timedelta(minutes=15):
            return Response({
                'error': 'Account was synced recently. Please wait before syncing again.',
                'last_sync': account.last_sync
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Trigger sync based on platform
        if account.platform == 'instagram':
            task = sync_instagram_data.delay(str(account.id))
        elif account.platform == 'youtube':
            task = sync_youtube_data.delay(str(account.id))
        else:
            return Response({'error': f'Manual sync not supported for {account.platform}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'message': f'Manual sync triggered for {account.platform} account "{account.username}"',
            'task_id': task.id,
            'account_id': str(account.id)
        })
        
    except Exception as e:
        logger.error(f"Failed to trigger manual sync for account {account_id}: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sync_status(request, account_id):
    """Get sync status for a specific account"""
    try:
        if request.user.role not in ['client', 'admin']:
            return Response({'error': 'Permission denied'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        try:
            if request.user.role == 'client':
                client = request.user.client_profile
                account = SocialMediaAccount.objects.get(
                    id=account_id,
                    client=client
                )
            else:  # admin
                account = SocialMediaAccount.objects.get(id=account_id)
        except SocialMediaAccount.DoesNotExist:
            return Response({'error': 'Account not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Get recent sync logs
        recent_logs = account.sync_logs.order_by('-started_at')[:5]
        
        sync_logs = []
        for log in recent_logs:
            sync_logs.append({
                'id': str(log.id),
                'sync_type': log.sync_type,
                'status': log.status,
                'records_processed': log.records_processed,
                'error_message': log.error_message,
                'started_at': log.started_at,
                'completed_at': log.completed_at,
                'duration': (log.completed_at - log.started_at).total_seconds() if log.completed_at else None
            })
        
        return Response({
            'account': {
                'id': str(account.id),
                'platform': account.platform,
                'username': account.username,
                'is_active': account.is_active,
                'last_sync': account.last_sync,
            },
            'sync_logs': sync_logs,
            'can_sync_now': not account.last_sync or account.last_sync <= timezone.now() - timedelta(minutes=15)
        })
        
    except Exception as e:
        logger.error(f"Failed to get sync status for account {account_id}: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)