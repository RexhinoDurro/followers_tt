# server/api/services/instagram_service.py
import requests
import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from ..models import SocialMediaAccount, RealTimeMetrics, PostMetrics, SyncLog

logger = logging.getLogger(__name__)

class InstagramService:
    """Instagram Business API service for fetching real data"""
    
    def __init__(self, social_account):
        self.account = social_account
        self.access_token = self.account.decrypt_token(social_account.access_token)
        self.base_url = "https://graph.facebook.com/v18.0"
    
    def sync_profile_metrics(self):
        """Fetch and save Instagram Business account metrics"""
        sync_log = SyncLog.objects.create(
            account=self.account,
            sync_type='profile',
            status='in_progress'
        )
        
        try:
            # Get basic profile info
            url = f"{self.base_url}/{self.account.account_id}"
            params = {
                'fields': 'followers_count,follows_count,media_count,profile_picture_url,username,name',
                'access_token': self.access_token
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            profile_data = response.json()
            
            # Get insights data
            insights = self._get_account_insights()
            
            # Calculate engagement rate
            engagement_rate = self._calculate_engagement_rate()
            
            # Save metrics
            metrics, created = RealTimeMetrics.objects.update_or_create(
                account=self.account,
                date=timezone.now().date(),
                defaults={
                    'followers_count': profile_data.get('followers_count', 0),
                    'following_count': profile_data.get('follows_count', 0),
                    'posts_count': profile_data.get('media_count', 0),
                    'engagement_rate': engagement_rate,
                    'reach': insights.get('reach', 0),
                    'impressions': insights.get('impressions', 0),
                    'profile_views': insights.get('profile_views', 0),
                    'website_clicks': insights.get('website_clicks', 0),
                }
            )
            
            # Calculate daily growth
            if not created:
                yesterday_metrics = RealTimeMetrics.objects.filter(
                    account=self.account,
                    date=timezone.now().date() - timedelta(days=1)
                ).first()
                
                if yesterday_metrics:
                    daily_growth = metrics.followers_count - yesterday_metrics.followers_count
                    metrics.daily_growth = daily_growth
                    metrics.save()
            
            # Update last sync time
            self.account.last_sync = timezone.now()
            self.account.save()
            
            sync_log.status = 'success'
            sync_log.records_processed = 1
            sync_log.completed_at = timezone.now()
            sync_log.save()
            
            logger.info(f"Successfully synced Instagram profile metrics for {self.account.username}")
            return metrics
            
        except requests.RequestException as e:
            error_msg = f"API request failed: {str(e)}"
            logger.error(f"Instagram API error for {self.account.username}: {error_msg}")
            
            sync_log.status = 'failed'
            sync_log.error_message = error_msg
            sync_log.completed_at = timezone.now()
            sync_log.save()
            
            raise e
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(f"Instagram sync error for {self.account.username}: {error_msg}")
            
            sync_log.status = 'failed'
            sync_log.error_message = error_msg
            sync_log.completed_at = timezone.now()
            sync_log.save()
            
            raise e
    
    def sync_recent_posts(self, limit=25):
        """Fetch recent posts and their metrics"""
        sync_log = SyncLog.objects.create(
            account=self.account,
            sync_type='posts',
            status='in_progress'
        )
        
        try:
            url = f"{self.base_url}/{self.account.account_id}/media"
            params = {
                'fields': 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
                'limit': limit,
                'access_token': self.access_token
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            posts_processed = 0
            
            for post_data in data.get('data', []):
                # Get detailed insights for each post
                insights = self._get_post_insights(post_data['id'])
                
                # Parse timestamp
                posted_at = datetime.fromisoformat(
                    post_data['timestamp'].replace('Z', '+00:00')
                )
                
                # Calculate engagement rate for this post
                likes = post_data.get('like_count', 0)
                comments = post_data.get('comments_count', 0)
                reach = insights.get('reach', 0)
                
                engagement_rate = 0
                if reach > 0:
                    engagement_rate = ((likes + comments) / reach) * 100
                
                post_metrics, created = PostMetrics.objects.update_or_create(
                    account=self.account,
                    post_id=post_data['id'],
                    defaults={
                        'caption': post_data.get('caption', ''),
                        'media_type': post_data.get('media_type', ''),
                        'posted_at': posted_at,
                        'likes': likes,
                        'comments': comments,
                        'reach': insights.get('reach', 0),
                        'impressions': insights.get('impressions', 0),
                        'saves': insights.get('saves', 0),
                        'shares': insights.get('shares', 0),
                        'engagement_rate': engagement_rate,
                    }
                )
                
                posts_processed += 1
            
            sync_log.status = 'success'
            sync_log.records_processed = posts_processed
            sync_log.completed_at = timezone.now()
            sync_log.save()
            
            logger.info(f"Successfully synced {posts_processed} Instagram posts for {self.account.username}")
            
        except requests.RequestException as e:
            error_msg = f"API request failed: {str(e)}"
            logger.error(f"Instagram posts API error for {self.account.username}: {error_msg}")
            
            sync_log.status = 'failed'
            sync_log.error_message = error_msg
            sync_log.completed_at = timezone.now()
            sync_log.save()
            
            raise e
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(f"Instagram posts sync error for {self.account.username}: {error_msg}")
            
            sync_log.status = 'failed'
            sync_log.error_message = error_msg
            sync_log.completed_at = timezone.now()
            sync_log.save()
            
            raise e
    
    def _get_account_insights(self):
        """Get account-level insights"""
        try:
            url = f"{self.base_url}/{self.account.account_id}/insights"
            params = {
                'metric': 'reach,impressions,profile_views,website_clicks',
                'period': 'day',
                'since': (timezone.now() - timedelta(days=1)).strftime('%Y-%m-%d'),
                'until': timezone.now().strftime('%Y-%m-%d'),
                'access_token': self.access_token
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            insights = {}
            for metric_data in data.get('data', []):
                metric_name = metric_data['name']
                values = metric_data.get('values', [])
                if values:
                    insights[metric_name] = values[-1].get('value', 0)
            
            return insights
            
        except requests.RequestException as e:
            logger.warning(f"Failed to get Instagram insights: {str(e)}")
            return {}
    
    def _get_post_insights(self, post_id):
        """Get insights for a specific post"""
        try:
            url = f"{self.base_url}/{post_id}/insights"
            params = {
                'metric': 'reach,impressions,saves,shares',
                'access_token': self.access_token
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            insights = {}
            for metric_data in data.get('data', []):
                metric_name = metric_data['name']
                values = metric_data.get('values', [])
                if values:
                    insights[metric_name] = values[0].get('value', 0)
            
            return insights
            
        except requests.RequestException as e:
            logger.warning(f"Failed to get post insights for {post_id}: {str(e)}")
            return {}
    
    def _calculate_engagement_rate(self):
        """Calculate overall engagement rate from recent posts"""
        try:
            recent_posts = PostMetrics.objects.filter(
                account=self.account,
                posted_at__gte=timezone.now() - timedelta(days=30)
            )[:10]  # Last 10 posts
            
            if not recent_posts:
                return 0
            
            total_engagement = sum(
                post.likes + post.comments for post in recent_posts
            )
            total_reach = sum(post.reach for post in recent_posts)
            
            if total_reach > 0:
                return (total_engagement / total_reach) * 100
            else:
                return 0
                
        except Exception as e:
            logger.warning(f"Failed to calculate engagement rate: {str(e)}")
            return 0
    
    def get_long_lived_token(self, short_lived_token):
        """Exchange short-lived token for long-lived token"""
        try:
            url = "https://graph.facebook.com/v18.0/oauth/access_token"
            params = {
                'grant_type': 'fb_exchange_token',
                'client_id': settings.INSTAGRAM_CLIENT_ID,
                'client_secret': settings.INSTAGRAM_CLIENT_SECRET,
                'fb_exchange_token': short_lived_token
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            return {
                'access_token': data['access_token'],
                'expires_in': data.get('expires_in', 5184000)  # Default 60 days
            }
            
        except requests.RequestException as e:
            logger.error(f"Failed to get long-lived Instagram token: {str(e)}")
            raise e
    
    def refresh_access_token(self):
        """Refresh the access token if it's about to expire"""
        try:
            if self.account.token_expires_at and self.account.token_expires_at > timezone.now():
                # Token is still valid
                return self.access_token
            
            # For Instagram, we need to refresh using the existing long-lived token
            url = "https://graph.facebook.com/v18.0/oauth/access_token"
            params = {
                'grant_type': 'fb_exchange_token',
                'client_id': settings.INSTAGRAM_CLIENT_ID,
                'client_secret': settings.INSTAGRAM_CLIENT_SECRET,
                'fb_exchange_token': self.access_token
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Update account with new token
            self.account.access_token = self.account.encrypt_token(data['access_token'])
            self.account.token_expires_at = timezone.now() + timedelta(
                seconds=data.get('expires_in', 5184000)
            )
            self.account.save()
            
            self.access_token = data['access_token']
            
            logger.info(f"Refreshed Instagram token for {self.account.username}")
            return self.access_token
            
        except requests.RequestException as e:
            logger.error(f"Failed to refresh Instagram token for {self.account.username}: {str(e)}")
            # Mark account as inactive if token refresh fails
            self.account.is_active = False
            self.account.save()
            raise e