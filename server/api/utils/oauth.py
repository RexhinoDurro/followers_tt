import secrets
from urllib.parse import urlencode
from django.conf import settings
from django.utils import timezone

class OAuthManager:
    @staticmethod
    def generate_instagram_auth_url(request):
        """Generate Instagram OAuth URL with proper state handling"""
        state = secrets.token_urlsafe(32)
        
        # Store state with timestamp
        request.session['instagram_oauth_state'] = state
        request.session['instagram_oauth_timestamp'] = timezone.now().timestamp()
        
        params = {
            'client_id': settings.INSTAGRAM_CLIENT_ID,
            'redirect_uri': settings.INSTAGRAM_REDIRECT_URI,
            'scope': 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement',
            'response_type': 'code',
            'state': state
        }
        
        return f"https://api.instagram.com/oauth/authorize?{urlencode(params)}"
    
    @staticmethod
    def generate_youtube_auth_url(request):
        """Generate YouTube OAuth URL with proper state handling"""
        state = secrets.token_urlsafe(32)
        
        # Store state with timestamp
        request.session['youtube_oauth_state'] = state
        request.session['youtube_oauth_timestamp'] = timezone.now().timestamp()
        
        params = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'redirect_uri': settings.YOUTUBE_REDIRECT_URI,
            'scope': ' '.join([
                'https://www.googleapis.com/auth/youtube.readonly',
                'https://www.googleapis.com/auth/youtube.force-ssl',
                'https://www.googleapis.com/auth/youtubepartner'
            ]),
            'response_type': 'code',
            'access_type': 'offline',
            'state': state,
            'prompt': 'consent'
        }
        
        return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    
    @staticmethod
    def validate_oauth_state(request, platform, state):
        """Validate OAuth state and check for expiration"""
        stored_state = request.session.get(f'{platform}_oauth_state')
        timestamp = request.session.get(f'{platform}_oauth_timestamp')
        
        if not stored_state or not timestamp:
            return False
            
        # Check if state matches and is not expired (10 minute window)
        current_time = timezone.now().timestamp()
        is_valid = stored_state == state and (current_time - float(timestamp)) < 600
        
        # Clean up session
        if is_valid:
            del request.session[f'{platform}_oauth_state']
            del request.session[f'{platform}_oauth_timestamp']
            
        return is_valid
