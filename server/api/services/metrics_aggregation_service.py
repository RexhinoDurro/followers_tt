# server/api/services/metrics_aggregation_service.py
"""
Service to aggregate RealTimeMetrics into PerformanceData
This bridges the gap between daily YouTube metrics and monthly performance summaries

USAGE:
1. Automatically aggregates daily metrics into monthly performance
2. Provides real-time stats for client dashboard
3. Syncs YouTube videos to content posts
"""

import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Avg, Sum, Max, Min, Count, F
from decimal import Decimal

from ..models import (
    RealTimeMetrics, PerformanceData, SocialMediaAccount, 
    Client, PostMetrics
)

logger = logging.getLogger(__name__)


class MetricsAggregationService:
    """Aggregate real-time metrics into monthly performance data"""
    
    @staticmethod
    def aggregate_monthly_performance(client, month_date=None):
        """
        Aggregate all social media metrics for a client for a given month
        
        Args:
            client: Client instance
            month_date: Date object for the month (defaults to current month)
        
        Returns:
            PerformanceData instance
        """
        if month_date is None:
            month_date = timezone.now().date().replace(day=1)
        
        # Get date range for the month
        if isinstance(month_date, datetime):
            month_date = month_date.date()
        
        start_date = month_date.replace(day=1)
        
        # Calculate last day of month
        import calendar
        last_day = calendar.monthrange(month_date.year, month_date.month)[1]
        end_date = month_date.replace(day=last_day)
        
        logger.info(f"Aggregating metrics for {client.name} from {start_date} to {end_date}")
        
        # Get all active social accounts for this client
        social_accounts = SocialMediaAccount.objects.filter(
            client=client,
            is_active=True
        )
        
        if not social_accounts.exists():
            logger.warning(f"No active social accounts found for client {client.name}")
            return None
        
        # Get metrics for all accounts in this month
        metrics = RealTimeMetrics.objects.filter(
            account__in=social_accounts,
            date__gte=start_date,
            date__lte=end_date
        )
        
        if not metrics.exists():
            logger.warning(f"No metrics found for client {client.name} in {month_date.strftime('%Y-%m')}")
            return None
        
        # Get latest metrics (most recent day in the month)
        latest_metrics = metrics.order_by('-date').first()
        
        # Calculate aggregated stats
        total_followers = 0
        total_reach = 0
        total_impressions = 0
        total_profile_views = 0
        total_clicks = 0
        engagement_rates = []
        
        # Get latest metrics per account
        for account in social_accounts:
            account_latest = metrics.filter(account=account).order_by('-date').first()
            if account_latest:
                total_followers += account_latest.followers_count
                total_reach += account_latest.reach
                total_impressions += account_latest.impressions
                total_profile_views += account_latest.profile_views
                total_clicks += account_latest.website_clicks
                engagement_rates.append(float(account_latest.engagement_rate))
        
        # Calculate average engagement
        avg_engagement = Decimal(sum(engagement_rates) / len(engagement_rates)) if engagement_rates else Decimal('0.00')
        
        # Calculate growth rate
        growth_rate = Decimal('0.00')
        try:
            # Get previous month's data
            previous_month = (start_date - timedelta(days=1)).replace(day=1)
            previous_data = PerformanceData.objects.filter(
                client=client,
                month=previous_month
            ).first()
            
            if previous_data and previous_data.followers > 0:
                growth_rate = Decimal(
                    ((total_followers - previous_data.followers) / previous_data.followers) * 100
                )
        except Exception as e:
            logger.warning(f"Failed to calculate growth rate: {e}")
        
        # Create or update PerformanceData
        performance_data, created = PerformanceData.objects.update_or_create(
            client=client,
            month=start_date,
            defaults={
                'followers': total_followers,
                'engagement': avg_engagement,
                'reach': total_reach,
                'clicks': total_clicks,
                'impressions': total_impressions,
                'growth_rate': growth_rate
            }
        )
        
        action = "Created" if created else "Updated"
        logger.info(
            f"{action} PerformanceData for {client.name} - "
            f"{month_date.strftime('%Y-%m')}: {total_followers} followers, "
            f"{avg_engagement}% engagement"
        )
        
        return performance_data
    
    @staticmethod
    def aggregate_all_clients_current_month():
        """Aggregate current month data for all clients"""
        clients = Client.objects.filter(status='active')
        current_month = timezone.now().date().replace(day=1)
        
        results = []
        for client in clients:
            try:
                perf_data = MetricsAggregationService.aggregate_monthly_performance(
                    client, current_month
                )
                if perf_data:
                    results.append(perf_data)
            except Exception as e:
                logger.error(f"Failed to aggregate for client {client.name}: {e}")
        
        return results
    
    @staticmethod
    def get_client_real_time_stats(client):
        """
        Get real-time stats for client dashboard (alternative to monthly performance)
        This provides up-to-date stats without waiting for monthly aggregation
        """
        social_accounts = SocialMediaAccount.objects.filter(
            client=client,
            is_active=True
        )
        
        if not social_accounts.exists():
            return {
                'total_followers': 0,
                'engagement_rate': 0,
                'posts_this_month': 0,
                'reach': 0,
                'growth_rate': 0
            }
        
        # Get latest metrics for each account
        total_followers = 0
        total_reach = 0
        engagement_rates = []
        daily_growths = []
        
        for account in social_accounts:
            latest = RealTimeMetrics.objects.filter(
                account=account
            ).order_by('-date').first()
            
            if latest:
                total_followers += latest.followers_count
                total_reach += latest.reach
                engagement_rates.append(float(latest.engagement_rate))
                daily_growths.append(latest.daily_growth)
        
        avg_engagement = sum(engagement_rates) / len(engagement_rates) if engagement_rates else 0
        total_daily_growth = sum(daily_growths)
        
        # Calculate growth rate from last 30 days
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        growth_rate = 0
        
        try:
            old_metrics = RealTimeMetrics.objects.filter(
                account__in=social_accounts,
                date=thirty_days_ago
            )
            
            if old_metrics.exists():
                old_followers = sum(m.followers_count for m in old_metrics)
                if old_followers > 0:
                    growth_rate = ((total_followers - old_followers) / old_followers) * 100
        except Exception as e:
            logger.warning(f"Failed to calculate 30-day growth: {e}")
        
        # Posts this month
        current_month = timezone.now().replace(day=1)
        posts_this_month = PostMetrics.objects.filter(
            account__in=social_accounts,
            posted_at__gte=current_month
        ).count()
        
        return {
            'total_followers': total_followers,
            'engagement_rate': round(avg_engagement, 2),
            'posts_this_month': posts_this_month,
            'reach': total_reach,
            'growth_rate': round(growth_rate, 2)
        }
    
    @staticmethod
    def sync_youtube_videos_to_content(account):
        """
        Sync YouTube PostMetrics to ContentPost records
        This creates content posts from YouTube videos for display
        """
        from ..models import ContentPost, ContentImage
        
        youtube_videos = PostMetrics.objects.filter(
            account=account,
            account__platform='youtube'
        ).order_by('-posted_at')[:50]  # Last 50 videos
        
        synced_count = 0
        
        for video in youtube_videos:
            try:
                # Check if content post already exists
                content_post, created = ContentPost.objects.update_or_create(
                    client=account.client,
                    platform='youtube',
                    social_account=account,
                    # Use post_id as unique identifier
                    post_url=f"https://youtube.com/watch?v={video.post_id}",
                    defaults={
                        'title': video.caption[:255] if len(video.caption) > 255 else video.caption,
                        'content': video.caption,
                        'scheduled_date': video.posted_at,
                        'status': 'posted',
                        'posted_at': video.posted_at,
                        'likes': video.likes,
                        'comments': video.comments,
                        'shares': video.shares,
                        'views': video.reach,  # YouTube views
                        'engagement_rate': video.engagement_rate
                    }
                )
                
                if created:
                    synced_count += 1
                    logger.info(f"Created ContentPost from YouTube video: {video.caption[:50]}")
                
            except Exception as e:
                logger.error(f"Failed to sync video {video.post_id}: {e}")
        
        logger.info(f"Synced {synced_count} new YouTube videos to content posts")
        return synced_count