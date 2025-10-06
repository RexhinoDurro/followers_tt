# server/api/tasks.py - ADD OR UPDATE THIS FILE
"""
Celery tasks for background processing
Handles YouTube sync, metrics aggregation, and scheduled tasks
"""

from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def sync_youtube_data(self, account_id):
    """
    Sync YouTube channel data and videos
    Runs after OAuth connection and on schedule
    """
    try:
        from .models import SocialMediaAccount
        from .services.youtube_service import YouTubeService
        from .services.metrics_aggregation_service import MetricsAggregationService
        
        account = SocialMediaAccount.objects.get(id=account_id, platform='youtube')
        
        logger.info(f"Starting YouTube sync for account: {account.username}")
        
        # Initialize service
        service = YouTubeService(account)
        
        # Sync channel metrics (subscribers, views, etc.)
        logger.info(f"Syncing channel metrics for {account.username}")
        service.sync_channel_metrics()
        
        # Sync recent videos
        logger.info(f"Syncing recent videos for {account.username}")
        service.sync_recent_videos(limit=25)
        
        # Sync videos to content posts
        logger.info(f"Syncing videos to content posts for {account.username}")
        MetricsAggregationService.sync_youtube_videos_to_content(account)
        
        # Update last sync time
        account.last_sync = timezone.now()
        account.save()
        
        logger.info(f"✓ YouTube sync completed successfully for {account.username}")
        
        return {
            'success': True,
            'account_id': str(account_id),
            'username': account.username,
            'synced_at': timezone.now().isoformat()
        }
        
    except SocialMediaAccount.DoesNotExist:
        logger.error(f"Account {account_id} not found")
        return {'success': False, 'error': 'Account not found'}
        
    except Exception as e:
        logger.error(f"YouTube sync failed for {account_id}: {str(e)}", exc_info=True)
        
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=3)
def sync_instagram_data(self, account_id):
    """Sync Instagram account data"""
    try:
        from .models import SocialMediaAccount
        from .services.instagram_service import InstagramService
        from .services.metrics_aggregation_service import MetricsAggregationService
        
        account = SocialMediaAccount.objects.get(id=account_id, platform='instagram')
        
        logger.info(f"Starting Instagram sync for account: {account.username}")
        
        service = InstagramService(account)
        
        # Sync profile metrics
        service.sync_profile_metrics()
        
        # Sync recent posts
        service.sync_recent_posts(limit=25)
        
        # Update last sync
        account.last_sync = timezone.now()
        account.save()
        
        logger.info(f"✓ Instagram sync completed for {account.username}")
        
        return {'success': True, 'account_id': str(account_id)}
        
    except Exception as e:
        logger.error(f"Instagram sync failed: {str(e)}")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@shared_task
def aggregate_monthly_performance():
    """
    Aggregate daily metrics into monthly performance data
    Run this at the end of each month or daily to keep data fresh
    """
    try:
        from .models import Client
        from .services.metrics_aggregation_service import MetricsAggregationService
        
        logger.info("Starting monthly performance aggregation for all clients")
        
        results = MetricsAggregationService.aggregate_all_clients_current_month()
        
        logger.info(f"✓ Aggregated performance data for {len(results)} clients")
        
        return {
            'success': True,
            'clients_processed': len(results),
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Monthly aggregation failed: {str(e)}")
        return {'success': False, 'error': str(e)}


@shared_task
def sync_all_youtube_accounts():
    """
    Sync all active YouTube accounts
    Run this on a schedule (e.g., every 6 hours)
    """
    try:
        from .models import SocialMediaAccount
        
        youtube_accounts = SocialMediaAccount.objects.filter(
            platform='youtube',
            is_active=True
        )
        
        logger.info(f"Syncing {youtube_accounts.count()} YouTube accounts")
        
        results = []
        for account in youtube_accounts:
            try:
                task = sync_youtube_data.delay(str(account.id))
                results.append({
                    'account_id': str(account.id),
                    'username': account.username,
                    'task_id': task.id
                })
            except Exception as e:
                logger.error(f"Failed to queue sync for {account.username}: {e}")
        
        logger.info(f"✓ Queued {len(results)} YouTube sync tasks")
        
        return {
            'success': True,
            'accounts_queued': len(results),
            'results': results
        }
        
    except Exception as e:
        logger.error(f"Batch YouTube sync failed: {str(e)}")
        return {'success': False, 'error': str(e)}


@shared_task
def sync_all_instagram_accounts():
    """Sync all active Instagram accounts"""
    try:
        from .models import SocialMediaAccount
        
        instagram_accounts = SocialMediaAccount.objects.filter(
            platform='instagram',
            is_active=True
        )
        
        logger.info(f"Syncing {instagram_accounts.count()} Instagram accounts")
        
        results = []
        for account in instagram_accounts:
            try:
                task = sync_instagram_data.delay(str(account.id))
                results.append({
                    'account_id': str(account.id),
                    'task_id': task.id
                })
            except Exception as e:
                logger.error(f"Failed to queue Instagram sync: {e}")
        
        return {
            'success': True,
            'accounts_queued': len(results)
        }
        
    except Exception as e:
        logger.error(f"Batch Instagram sync failed: {str(e)}")
        return {'success': False, 'error': str(e)}


# ============ PERIODIC TASK SCHEDULE ============
