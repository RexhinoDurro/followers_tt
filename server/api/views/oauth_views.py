# server/api/views/oauth_views.py - Fixed OAuth flow
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
from urllib.parse import urlencode, parse_qs

from ..models import SocialMediaAccount, Client
from ..serializers import SocialMediaAccountSerializer

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def initiate_instagram_oauth(request):
    """Initiate Instagram OAuth flow"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can connect social accounts'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Check if Instagram credentials are configured
        if not settings.INSTAGRAM_CLIENT_ID or not settings.INSTAGRAM_CLIENT_SECRET:
            return Response({
                'error': 'Instagram OAuth is not configured. Please contact administrator.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Generate state parameter for security
        state = secrets.token_urlsafe(32)
        
        # Store state in session for verification
        request.session[f'oauth_state_instagram_{request.user.id}'] = state
        
        # Build Instagram OAuth URL - redirect to BACKEND callback
        params = {
            'client_id': settings.INSTAGRAM_CLIENT_ID,
            'redirect_uri': f"{request.build_absolute_uri('/api/oauth/instagram/callback/')}",
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

@csrf_exempt
@require_http_methods(["GET"])
def handle_instagram_callback(request):
    """Handle Instagram OAuth callback - this receives the redirect from Instagram"""
    try:
        code = request.GET.get('code')
        state = request.GET.get('state')
        error = request.GET.get('error')
        
        # Handle OAuth errors
        if error:
            logger.error(f"Instagram OAuth error: {error}")
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?error=oauth_failed")
        
        if not code:
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?error=no_code")
        
        # Find user by state (since we're not authenticated in this callback)
        user_id = None
        for session_key in request.session.keys():
            if session_key.startswith('oauth_state_instagram_') and request.session[session_key] == state:
                user_id = session_key.replace('oauth_state_instagram_', '')
                break
        
        if not user_id:
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?error=invalid_state")
        
        # Get user and client
        from ..models import User
        try:
            user = User.objects.get(id=user_id)
            client = user.client_profile
        except (User.DoesNotExist, Client.DoesNotExist):
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?error=user_not_found")
        
        # Exchange code for access token
        token_url = "https://api.instagram.com/oauth/access_token"
        token_data = {
            'client_id': settings.INSTAGRAM_CLIENT_ID,
            'client_secret': settings.INSTAGRAM_CLIENT_SECRET,
            'grant_type': 'authorization_code',
            'redirect_uri': request.build_absolute_uri('/api/oauth/instagram/callback/'),
            'code': code
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        token_result = token_response.json()
        
        if 'access_token' not in token_result:
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?error=token_failed")
        
        # Get long-lived token
        long_lived_url = "https://graph.facebook.com/v18.0/oauth/access_token"
        long_lived_params = {
            'grant_type': 'fb_exchange_token',
            'client_id': settings.INSTAGRAM_CLIENT_ID,
            'client_secret': settings.INSTAGRAM_CLIENT_SECRET,
            'fb_exchange_token': token_result['access_token']
        }
        
        long_lived_response = requests.get(long_lived_url, params=long_lived_params)
        long_lived_response.raise_for_status()
        long_lived_result = long_lived_response.json()
        
        # Get user info
        user_info_url = f"https://graph.facebook.com/v18.0/me?fields=id,username&access_token={long_lived_result['access_token']}"
        user_response = requests.get(user_info_url)
        user_response.raise_for_status()
        user_data = user_response.json()
        
        # Save social media account
        account, created = SocialMediaAccount.objects.update_or_create(
            client=client,
            platform='instagram',
            account_id=user_data['id'],
            defaults={
                'username': user_data.get('username', 'Unknown'),
                'access_token': long_lived_result['access_token'],  # Will be encrypted in save()
                'token_expires_at': timezone.now() + timedelta(seconds=long_lived_result.get('expires_in', 5184000)),
                'is_active': True
            }
        )
        
        # Clean up session
        session_key = f'oauth_state_instagram_{user_id}'
        if session_key in request.session:
            del request.session[session_key]
        
        # Redirect back to frontend with success
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?connected=instagram&username={user_data.get('username', 'Unknown')}")
        
    except requests.RequestException as e:
        logger.error(f"Instagram OAuth API error: {str(e)}")
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?error=api_failed")
    except Exception as e:
        logger.error(f"Instagram OAuth callback error: {str(e)}")
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?error=unknown")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def initiate_youtube_oauth(request):
    """Initiate YouTube OAuth flow"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can connect social accounts'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Check if Google credentials are configured
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            return Response({
                'error': 'YouTube OAuth is not configured. Please contact administrator.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Generate state parameter for security
        state = secrets.token_urlsafe(32)
        
        # Store state in session
        request.session[f'oauth_state_youtube_{request.user.id}'] = state
        
        # Build Google OAuth URL
        params = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'redirect_uri': f"{request.build_absolute_uri('/api/oauth/youtube/callback/')}",
            'scope': 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly',
            'response_type': 'code',
            'access_type': 'offline',
            'prompt': 'consent',
            'state': state
        }
        
        oauth_url = f"https://accounts.google.com/oauth2/auth?{urlencode(params)}"
        
        return Response({
            'oauth_url': oauth_url,
            'state': state
        })
        
    except Exception as e:
        logger.error(f"Failed to initiate YouTube OAuth: {str(e)}")
        return Response({'error': 'Failed to initiate OAuth'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@require_http_methods(["GET"])
def handle_youtube_callback(request):
    """Handle YouTube OAuth callback"""
    try:
        code = request.GET.get('code')
        state = request.GET.get('state')
        error = request.GET.get('error')
        
        # Handle OAuth errors
        if error:
            logger.error(f"YouTube OAuth error: {error}")
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?error=oauth_failed")
        
        if not code:
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?error=no_code")
        
        # Find user by state
        user_id = None
        for session_key in request.session.keys():
            if session_key.startswith('oauth_state_youtube_') and request.session[session_key] == state:
                user_id = session_key.replace('oauth_state_youtube_', '')
                break
        
        if not user_id:
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?error=invalid_state")
        
        # Get user and client
        from ..models import User
        try:
            user = User.objects.get(id=user_id)
            client = user.client_profile
        except (User.DoesNotExist, Client.DoesNotExist):
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?error=user_not_found")
        
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': request.build_absolute_uri('/api/oauth/youtube/callback/'),
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        token_result = token_response.json()
        
        if 'access_token' not in token_result:
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?error=token_failed")
        
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
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?error=no_channel")
        
        channel_data = channels_response['items'][0]
        channel_id = channel_data['id']
        channel_title = channel_data['snippet']['title']
        
        # Save social media account
        expires_in = token_result.get('expires_in', 3600)
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
        session_key = f'oauth_state_youtube_{user_id}'
        if session_key in request.session:
            del request.session[session_key]
        
        # Redirect back to frontend with success
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?connected=youtube&username={channel_title}")
        
    except requests.RequestException as e:
        logger.error(f"YouTube OAuth API error: {str(e)}")
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?error=api_failed")
    except Exception as e:
        logger.error(f"YouTube OAuth callback error: {str(e)}")
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?error=unknown")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_connected_accounts(request):
    """Get all connected social media accounts for current user"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can view social accounts'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        try:
            client = request.user.client_profile
        except Client.DoesNotExist:
            return Response({'error': 'Client profile not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        accounts = SocialMediaAccount.objects.filter(client=client)
        serializer = SocialMediaAccountSerializer(accounts, many=True)
        
        return Response({
            'accounts': serializer.data,
            'total_count': len(serializer.data)
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
        
        # For now, just return a success message
        # In production, you would trigger actual sync tasks here
        return Response({
            'message': f'Manual sync triggered for {account.platform} account "{account.username}"',
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
        
        return Response({
            'account': {
                'id': str(account.id),
                'platform': account.platform,
                'username': account.username,
                'is_active': account.is_active,
                'last_sync': account.last_sync,
            },
            'sync_logs': [],  # Empty for now
            'can_sync_now': True  # Always true for demo
        })
        
    except Exception as e:
        logger.error(f"Failed to get sync status for account {account_id}: {str(e)}")
        return Response({'error': 'Internal server error'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)