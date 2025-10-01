# server/api/views/oauth_views.py - BACKEND-ONLY OAUTH FLOW
from django.http import HttpResponseRedirect
from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
import requests
import secrets
import logging
from datetime import timedelta
from urllib.parse import urlencode, parse_qs

from ..models import SocialMediaAccount, Client
from ..services.instagram_service import InstagramService
from ..services.youtube_service import YouTubeService
from ..tasks import sync_instagram_data, sync_youtube_data

logger = logging.getLogger(__name__)

# ============ INSTAGRAM OAUTH - BACKEND FLOW ============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def initiate_instagram_oauth(request):
    """Step 1: Generate Instagram OAuth URL and redirect user"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can connect social accounts'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Generate and store state for CSRF protection
        state = secrets.token_urlsafe(32)
        request.session[f'oauth_state_instagram'] = state
        request.session[f'oauth_user_id'] = str(request.user.id)
        
        # Build Instagram OAuth URL (points to BACKEND callback)
        params = {
            'client_id': settings.INSTAGRAM_CLIENT_ID,
            'redirect_uri': settings.INSTAGRAM_REDIRECT_URI,  # Backend URL!
            'scope': 'instagram_basic,instagram_manage_insights,pages_read_engagement',
            'response_type': 'code',
            'state': state
        }
        
        oauth_url = f"https://api.instagram.com/oauth/authorize?{urlencode(params)}"
        
        # Return URL for frontend to open (or redirect directly)
        return Response({
            'oauth_url': oauth_url,
            'state': state,
            'method': 'redirect'  # Tell frontend to do window.location.href
        })
        
    except Exception as e:
        logger.error(f"Failed to initiate Instagram OAuth: {str(e)}")
        return Response({'error': 'Failed to initiate OAuth'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt  # Instagram callback doesn't send CSRF token
@api_view(['GET'])
def handle_instagram_callback(request):
    """
    Step 2: Handle Instagram callback (user lands HERE after approval)
    This is a backend endpoint that Instagram redirects to
    """
    try:
        code = request.GET.get('code')
        state = request.GET.get('state')
        error = request.GET.get('error')
        
        # Handle user denial
        if error:
            logger.warning(f"Instagram OAuth denied: {error}")
            return HttpResponseRedirect(
                f"{settings.FRONTEND_URL}/dashboard#overview?oauth_error=denied"
            )
        
        if not code or not state:
            logger.error("Missing code or state in Instagram callback")
            return HttpResponseRedirect(
                f"{settings.FRONTEND_URL}/dashboard#overview?oauth_error=missing_params"
            )
        
        # Verify state (CSRF protection)
        stored_state = request.session.get('oauth_state_instagram')
        if not stored_state or stored_state != state:
            logger.error(f"State mismatch: stored={stored_state}, received={state}")
            return HttpResponseRedirect(
                f"{settings.FRONTEND_URL}/dashboard#overview?oauth_error=invalid_state"
            )
        
        # Get user ID from session
        user_id = request.session.get('oauth_user_id')
        if not user_id:
            logger.error("No user_id in session")
            return HttpResponseRedirect(
                f"{settings.FRONTEND_URL}/dashboard#overview?oauth_error=session_expired"
            )
        
        # Exchange code for access token
        token_url = "https://api.instagram.com/oauth/access_token"
        token_data = {
            'client_id': settings.INSTAGRAM_CLIENT_ID,
            'client_secret': settings.INSTAGRAM_CLIENT_SECRET,
            'grant_type': 'authorization_code',
            'redirect_uri': settings.INSTAGRAM_REDIRECT_URI,
            'code': code
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        token_result = token_response.json()
        
        if 'access_token' not in token_result:
            logger.error(f"No access token in response: {token_result}")
            return HttpResponseRedirect(
                f"{settings.FRONTEND_URL}/dashboard#overview?oauth_error=no_token"
            )
        
        # Get long-lived token
        service = InstagramService(None)
        long_lived_token = service.get_long_lived_token(token_result['access_token'])
        
        # Get user info
        user_info_url = f"https://graph.facebook.com/v18.0/me?fields=id,username&access_token={long_lived_token['access_token']}"
        user_response = requests.get(user_info_url)
        user_response.raise_for_status()
        user_data = user_response.json()
        
        # Get user and save account
        from ..models import User
        user = User.objects.get(id=user_id)
        client = user.client_profile
        
        account, created = SocialMediaAccount.objects.update_or_create(
            client=client,
            platform='instagram',
            account_id=user_data['id'],
            defaults={
                'username': user_data.get('username', 'Unknown'),
                'access_token': long_lived_token['access_token'],
                'token_expires_at': timezone.now() + timedelta(seconds=long_lived_token['expires_in']),
                'is_active': True
            }
        )
        
        # Clean up session
        if 'oauth_state_instagram' in request.session:
            del request.session['oauth_state_instagram']
        if 'oauth_user_id' in request.session:
            del request.session['oauth_user_id']
        
        # Trigger initial sync
        sync_instagram_data.delay(str(account.id))
        
        logger.info(f"Instagram account connected: {account.username} for user {user.email}")
        
        # Redirect to frontend success page
        return HttpResponseRedirect(
            f"{settings.FRONTEND_URL}/dashboard#overview?oauth_success=instagram&username={account.username}"
        )
        
    except requests.RequestException as e:
        logger.error(f"Instagram OAuth API error: {str(e)}")
        return HttpResponseRedirect(
            f"{settings.FRONTEND_URL}/dashboard#overview?oauth_error=api_failed"
        )
    except Exception as e:
        logger.error(f"Instagram OAuth callback error: {str(e)}", exc_info=True)
        return HttpResponseRedirect(
            f"{settings.FRONTEND_URL}/dashboard#overview?oauth_error=unknown"
        )


# ============ YOUTUBE OAUTH - BACKEND FLOW ============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def initiate_youtube_oauth(request):
    """Step 1: Generate YouTube OAuth URL"""
    try:
        if request.user.role != 'client':
            return Response({'error': 'Only clients can connect social accounts'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        state = secrets.token_urlsafe(32)
        request.session[f'oauth_state_youtube'] = state
        request.session[f'oauth_user_id'] = str(request.user.id)
        
        params = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'redirect_uri': settings.YOUTUBE_REDIRECT_URI,  # Backend URL!
            'scope': 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly',
            'response_type': 'code',
            'access_type': 'offline',
            'prompt': 'consent',
            'state': state
        }
        
        oauth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
        
        logger.info(f"YouTube OAuth URL generated for user {request.user.email}")
        
        return Response({
            'oauth_url': oauth_url,
            'state': state,
            'method': 'redirect'
        })
        
    except Exception as e:
        logger.error(f"Failed to initiate YouTube OAuth: {str(e)}")
        return Response({'error': 'Failed to initiate OAuth'}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])  # ← FIX: Allow unauthenticated access
def handle_youtube_callback(request):
    """Step 2: Handle YouTube callback"""
    try:
        code = request.GET.get('code')
        state = request.GET.get('state')
        error = request.GET.get('error')
        
        logger.info(f"YouTube callback received - code: {code[:20] if code else None}, state: {state[:20] if state else None}")
        
        if error:
            logger.warning(f"YouTube OAuth denied: {error}")
            return HttpResponseRedirect(
                f"{settings.FRONTEND_URL}/dashboard#overview?oauth_error=denied"
            )
        
        if not code or not state:
            logger.error("Missing code or state in YouTube callback")
            return HttpResponseRedirect(
                f"{settings.FRONTEND_URL}/dashboard#overview?oauth_error=missing_params"
            )
        
        # Verify state
        stored_state = request.session.get('oauth_state_youtube')
        if not stored_state:
            logger.error("No stored state in session")
            return HttpResponseRedirect(
                f"{settings.FRONTEND_URL}/dashboard#overview?oauth_error=session_expired"
            )
        
        if stored_state != state:
            logger.error(f"YouTube OAuth state mismatch - stored: {stored_state[:20]}, received: {state[:20]}")
            return HttpResponseRedirect(
                f"{settings.FRONTEND_URL}/dashboard#overview?oauth_error=invalid_state"
            )
        
        user_id = request.session.get('oauth_user_id')
        if not user_id:
            logger.error("No user_id in session")
            return HttpResponseRedirect(
                f"{settings.FRONTEND_URL}/dashboard#overview?oauth_error=session_expired"
            )
        
        logger.info(f"Processing YouTube callback for user_id: {user_id}")
        
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': settings.YOUTUBE_REDIRECT_URI,
        }
        
        logger.info("Exchanging code for tokens...")
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        token_result = token_response.json()
        
        if 'access_token' not in token_result:
            logger.error(f"No access token in YouTube response: {token_result}")
            return HttpResponseRedirect(
                f"{settings.FRONTEND_URL}/dashboard#overview?oauth_error=no_token"
            )
        
        logger.info("Access token received, fetching channel info...")
        
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
        channels_response = youtube.channels().list(
            part='snippet,statistics',
            mine=True
        ).execute()
        
        if not channels_response.get('items'):
            logger.error("No YouTube channel found for this account")
            return HttpResponseRedirect(
                f"{settings.FRONTEND_URL}/dashboard#overview?oauth_error=no_channel"
            )
        
        channel_data = channels_response['items'][0]
        channel_id = channel_data['id']
        channel_title = channel_data['snippet']['title']
        
        logger.info(f"Channel found: {channel_title} (ID: {channel_id})")
        
        # Save account
        from ..models import User
        user = User.objects.get(id=user_id)
        client = user.client_profile
        
        expires_in = token_result.get('expires_in', 3600)
        token_expires_at = timezone.now() + timedelta(seconds=expires_in)
        
        account, created = SocialMediaAccount.objects.update_or_create(
            client=client,
            platform='youtube',
            account_id=channel_id,
            defaults={
                'username': channel_title,
                'access_token': token_result['access_token'],
                'refresh_token': token_result.get('refresh_token', ''),
                'token_expires_at': token_expires_at,
                'is_active': True
            }
        )
        
        logger.info(f"Account saved: {account.username} (created: {created})")
        
        # Clean up session
        if 'oauth_state_youtube' in request.session:
            del request.session['oauth_state_youtube']
        if 'oauth_user_id' in request.session:
            del request.session['oauth_user_id']
        
        # Trigger sync
        try:
            sync_youtube_data.delay(str(account.id))
            logger.info(f"Sync task queued for account {account.id}")
        except Exception as sync_error:
            logger.warning(f"Failed to queue sync task: {sync_error}")
            # Don't fail the connection if sync fails
        
        logger.info(f"YouTube channel connected successfully: {account.username} for user {user.email}")
        
        return HttpResponseRedirect(
            f"{settings.FRONTEND_URL}/dashboard#overview?oauth_success=youtube&username={channel_title}"
        )
        
    except requests.RequestException as e:
        logger.error(f"YouTube OAuth API error: {str(e)}", exc_info=True)
        return HttpResponseRedirect(
            f"{settings.FRONTEND_URL}/dashboard#overview?oauth_error=api_failed"
        )
    except Exception as e:
        logger.error(f"YouTube OAuth callback error: {str(e)}", exc_info=True)
        return HttpResponseRedirect(
            f"{settings.FRONTEND_URL}/dashboard#overview?oauth_error=unknown"
        )
# ============ OTHER ENDPOINTS (Keep existing) ============

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