# server/api/services/youtube_service.py
import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
import json
import requests

from ..models import SocialMediaAccount, RealTimeMetrics, PostMetrics, SyncLog

logger = logging.getLogger(__name__)

class YouTubeService:
    """YouTube Data API service for fetching real data"""
    
    def __init__(self, social_account):
        self.account = social_account
        self.access_token = self.account.decrypt_token(social_account.access_token)
        self.refresh_token = self.account.decrypt_token(social_account.refresh_token) if social_account.refresh_token else None
        self.service = self._build_service()
    
    def _build_service(self):
        """Build YouTube API service with credentials"""
        try:
            creds = Credentials(
                token=self.access_token,
                refresh_token=self.refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.GOOGLE_CLIENT_ID,
                client_secret=settings.GOOGLE_CLIENT_SECRET,
                scopes=['https://www.googleapis.com/auth/youtube.readonly',
                       'https://www.googleapis.com/auth/yt-analytics.readonly']
            )
            
            # Refresh token if needed
            if creds.expired and creds.refresh_token:
                creds.refresh(Request())
                
                # Update stored tokens
                self.account.access_token = self.account.encrypt_token(creds.token)
                if creds.refresh_token:
                    self.account.refresh_token = self.account.encrypt_token(creds.refresh_token)
                self.account.token_expires_at = creds.expiry
                self.account.save()
            
            return build('youtube', 'v3', credentials=creds)
            
        except Exception as e:
            logger.error(f"Failed to build YouTube service for {self.account.username}: {str(e)}")
            self.account.is_active = False
            self.account.save()
            raise e
    
    def sync_channel_metrics(self):
        """Sync YouTube channel statistics"""
        sync_log = SyncLog.objects.create(
            account=self.account,
            sync_type='profile',
            status='in_progress'
        )
        
        try:
            # Get channel statistics
            request = self.service.channels().list(
                part='statistics,snippet,brandingSettings',
                mine=True
            )
            response = request.execute()
            
            if not response['items']:
                raise ValueError("No channel found for authenticated user")
            
            channel_data = response['items'][0]
            stats = channel_data['statistics']
            snippet = channel_data['snippet']
            
            # Get analytics data for additional metrics
            analytics_data = self._get_channel_analytics()
            
            # Calculate engagement rate from recent videos
            engagement_rate = self._calculate_channel_engagement_rate()
            
            metrics, created = RealTimeMetrics.objects.update_or_create(
                account=self.account,
                date=timezone.now().date(),
                defaults={
                    'followers_count': int(stats.get('subscriberCount', 0)),
                    'posts_count': int(stats.get('videoCount', 0)),
                    'reach': int(stats.get('viewCount', 0)),  # Total views as reach
                    'impressions': analytics_data.get('impressions', 0),
                    'engagement_rate': engagement_rate,
                    'profile_views': analytics_data.get('channel_views', 0),
                    'website_clicks': analytics_data.get('annotation_clicks', 0),
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
            
            # Update account info
            self.account.username = snippet.get('title', self.account.username)
            self.account.last_sync = timezone.now()
            self.account.save()
            
            sync_log.status = 'success'
            sync_log.records_processed = 1
            sync_log.completed_at = timezone.now()
            sync_log.save()
            
            logger.info(f"Successfully synced YouTube channel metrics for {self.account.username}")
            return metrics
            
        except Exception as e:
            error_msg = f"YouTube channel sync error: {str(e)}"
            logger.error(f"YouTube sync error for {self.account.username}: {error_msg}")
            
            sync_log.status = 'failed'
            sync_log.error_message = error_msg
            sync_log.completed_at = timezone.now()
            sync_log.save()
            
            raise e
    
    def sync_recent_videos(self, limit=25):
        """Sync recent video performance"""
        sync_log = SyncLog.objects.create(
            account=self.account,
            sync_type='posts',
            status='in_progress'
        )
        
        try:
            # Get recent videos
            search_request = self.service.search().list(
                part='id,snippet',
                forMine=True,
                type='video',
                order='date',
                maxResults=limit
            )
            search_response = search_request.execute()
            
            if not search_response.get('items'):
                logger.info(f"No videos found for {self.account.username}")
                sync_log.status = 'success'
                sync_log.records_processed = 0
                sync_log.completed_at = timezone.now()
                sync_log.save()
                return
            
            video_ids = [item['id']['videoId'] for item in search_response['items']]
            
            # Get detailed stats for videos
            stats_request = self.service.videos().list(
                part='statistics,snippet',
                id=','.join(video_ids)
            )
            stats_response = stats_request.execute()
            
            videos_processed = 0
            
            for i, video in enumerate(search_response['items']):
                video_id = video['id']['videoId']
                snippet = video['snippet']
                
                # Find corresponding stats
                stats_data = None
                for stats_video in stats_response['items']:
                    if stats_video['id'] == video_id:
                        stats_data = stats_video['statistics']
                        break
                
                if not stats_data:
                    continue
                
                # Parse publish date
                published_at = datetime.fromisoformat(
                    snippet['publishedAt'].replace('Z', '+00:00')
                )
                
                # Calculate engagement rate
                likes = int(stats_data.get('likeCount', 0))
                comments = int(stats_data.get('commentCount', 0))
                views = int(stats_data.get('viewCount', 0))
                
                engagement_rate = 0
                if views > 0:
                    engagement_rate = ((likes + comments) / views) * 100
                
                post_metrics, created = PostMetrics.objects.update_or_create(
                    account=self.account,
                    post_id=video_id,
                    defaults={
                        'caption': snippet['title'],
                        'media_type': 'video',
                        'posted_at': published_at,
                        'likes': likes,
                        'comments': comments,
                        'reach': views,
                        'impressions': views,  # For YouTube, views = impressions
                        'engagement_rate': engagement_rate,
                    }
                )
                
                videos_processed += 1
            
            sync_log.status = 'success'
            sync_log.records_processed = videos_processed
            sync_log.completed_at = timezone.now()
            sync_log.save()
            
            logger.info(f"Successfully synced {videos_processed} YouTube videos for {self.account.username}")
            
        except Exception as e:
            error_msg = f"YouTube videos sync error: {str(e)}"
            logger.error(f"YouTube videos sync error for {self.account.username}: {error_msg}")
            
            sync_log.status = 'failed'
            sync_log.error_message = error_msg
            sync_log.completed_at = timezone.now()
            sync_log.save()
            
            raise e
    
    def _get_channel_analytics(self):
        """Get YouTube Analytics data"""
        try:
            # Build YouTube Analytics service
            analytics_service = build('youtubeAnalytics', 'v2', credentials=self.service._http.credentials)
            
            # Get analytics for last 28 days
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=28)
            
            request = analytics_service.reports().query(
                ids='channel==MINE',
                startDate=start_date.strftime('%Y-%m-%d'),
                endDate=end_date.strftime('%Y-%m-%d'),
                metrics='views,impressions,subscribersGained,subscribersLost,likes,comments,shares,estimatedMinutesWatched,averageViewDuration,annotationClickThroughRate',
                dimensions='day'
            )
            
            response = request.execute()
            
            analytics_data = {}
            if response.get('rows'):
                # Sum up the metrics
                total_views = sum(row[1] for row in response['rows'])
                total_impressions = sum(row[2] for row in response['rows'])
                total_subscribers_gained = sum(row[3] for row in response['rows'])
                total_subscribers_lost = sum(row[4] for row in response['rows'])
                total_likes = sum(row[5] for row in response['rows'])
                total_comments = sum(row[6] for row in response['rows'])
                total_shares = sum(row[7] for row in response['rows'])
                total_watch_time = sum(row[8] for row in response['rows'])
                avg_view_duration = sum(row[9] for row in response['rows']) / len(response['rows'])
                
                analytics_data = {
                    'views': total_views,
                    'impressions': total_impressions,
                    'subscribers_gained': total_subscribers_gained,
                    'subscribers_lost': total_subscribers_lost,
                    'likes': total_likes,
                    'comments': total_comments,
                    'shares': total_shares,
                    'watch_time_minutes': total_watch_time,
                    'avg_view_duration': avg_view_duration,
                    'channel_views': total_views,
                    'annotation_clicks': 0  # This metric is deprecated but kept for compatibility
                }
            
            return analytics_data
            
        except Exception as e:
            logger.warning(f"Failed to get YouTube Analytics data: {str(e)}")
            return {}
    
    def _calculate_channel_engagement_rate(self):
        """Calculate overall engagement rate from recent videos"""
        try:
            recent_videos = PostMetrics.objects.filter(
                account=self.account,
                posted_at__gte=timezone.now() - timedelta(days=30)
            )[:10]  # Last 10 videos
            
            if not recent_videos:
                return 0
            
            total_engagement = sum(
                video.likes + video.comments for video in recent_videos
            )
            total_views = sum(video.reach for video in recent_videos)
            
            if total_views > 0:
                return (total_engagement / total_views) * 100
            else:
                return 0
                
        except Exception as e:
            logger.warning(f"Failed to calculate YouTube engagement rate: {str(e)}")
            return 0