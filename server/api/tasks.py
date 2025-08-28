# server/api/tasks.py
from celery import shared_task
from celery.utils.log import get_task_logger
from django.utils import timezone
from datetime import timedelta
from django.db import transaction
from .models import SocialMediaAccount, Client, RealTimeMetrics, PerformanceData, PostMetrics
from .services.instagram_service import InstagramService
from .services.youtube_service import YouTubeService

logger = get_task_logger(__name__)

@shared_task(bind=True, max_retries=3)
def sync_all_client_data(self):
    """Sync data for all active social media accounts"""
    try:
        accounts = SocialMediaAccount.objects.filter(is_active=True)
        total_accounts = accounts.count()
        
        logger.info(f"Starting sync for {total_accounts} active social media accounts")
        
        success_count = 0
        error_count = 0
        
        for account in accounts:
            try:
                if account.platform == 'instagram':
                    sync_instagram_data.delay(str(account.id))
                elif account.platform == 'youtube':
                    sync_youtube_data.delay(str(account.id))
                # Add more platforms here as needed
                
                success_count += 1
                
            except Exception as e:
                error_count += 1
                logger.error(f"Failed to queue sync for account {account.id}: {str(e)}")
        
        logger.info(f"Sync queued: {success_count} successful, {error_count} errors")
        
        return {
            'total_accounts': total_accounts,
            'success_count': success_count,
            'error_count': error_count
        }
        
    except Exception as exc:
        logger.error(f"Failed to sync all client data: {str(exc)}")
        raise self.retry(exc=exc, countdown=300)  # Retry in 5 minutes

@shared_task(bind=True, max_retries=3)
def sync_instagram_data(self, account_id):
    """Sync Instagram account data"""
    try:
        account = SocialMediaAccount.objects.get(id=account_id, platform='instagram')
        
        if not account.is_active:
            logger.info(f"Skipping inactive Instagram account: {account.username}")
            return {'status': 'skipped', 'reason': 'inactive'}
        
        logger.info(f"Starting Instagram sync for: {account.username}")
        
        service = InstagramService(account)
        
        # Sync profile metrics
        profile_metrics = service.sync_profile_metrics()
        
        # Sync recent posts
        service.sync_recent_posts()
        
        # Update client performance data
        update_client_monthly_performance.delay(str(account.client.id))
        
        logger.info(f"Successfully completed Instagram sync for: {account.username}")
        
        return {
            'status': 'success',
            'account_id': account_id,
            'username': account.username,
            'followers': profile_metrics.followers_count if profile_metrics else 0
        }
        
    except SocialMediaAccount.DoesNotExist:
        error_msg = f"Instagram account not found: {account_id}"
        logger.error(error_msg)
        return {'status': 'error', 'message': error_msg}
        
    except Exception as exc:
        logger.error(f"Failed to sync Instagram data for account {account_id}: {str(exc)}")
        
        # Mark account as having sync issues after max retries
        if self.request.retries >= self.max_retries:
            try:
                account = SocialMediaAccount.objects.get(id=account_id)
                # Don't deactivate, but log the persistent error
                logger.error(f"Max retries reached for Instagram account {account.username}")
            except:
                pass
        
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))

@shared_task(bind=True, max_retries=3)
def sync_youtube_data(self, account_id):
    """Sync YouTube channel data"""
    try:
        account = SocialMediaAccount.objects.get(id=account_id, platform='youtube')
        
        if not account.is_active:
            logger.info(f"Skipping inactive YouTube account: {account.username}")
            return {'status': 'skipped', 'reason': 'inactive'}
        
        logger.info(f"Starting YouTube sync for: {account.username}")
        
        service = YouTubeService(account)
        
        # Sync channel metrics
        channel_metrics = service.sync_channel_metrics()
        
        # Sync recent videos
        service.sync_recent_videos()
        
        # Update client performance data
        update_client_monthly_performance.delay(str(account.client.id))
        
        logger.info(f"Successfully completed YouTube sync for: {account.username}")
        
        return {
            'status': 'success',
            'account_id': account_id,
            'username': account.username,
            'subscribers': channel_metrics.followers_count if channel_metrics else 0
        }
        
    except SocialMediaAccount.DoesNotExist:
        error_msg = f"YouTube account not found: {account_id}"
        logger.error(error_msg)
        return {'status': 'error', 'message': error_msg}
        
    except Exception as exc:
        logger.error(f"Failed to sync YouTube data for account {account_id}: {str(exc)}")
        
        # Mark account as having sync issues after max retries
        if self.request.retries >= self.max_retries:
            try:
                account = SocialMediaAccount.objects.get(id=account_id)
                logger.error(f"Max retries reached for YouTube account {account.username}")
            except:
                pass
        
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))

@shared_task(bind=True, max_retries=2)
def update_client_monthly_performance(self, client_id):
    """Update monthly performance data for a client"""
    try:
        client = Client.objects.get(id=client_id)
        current_month = timezone.now().replace(day=1).date()
        
        logger.info(f"Updating monthly performance for client: {client.name}")
        
        # Get latest metrics from all client's social accounts
        latest_metrics = RealTimeMetrics.objects.filter(
            account__client=client,
            date__gte=current_month
        ).order_by('account', '-date')
        
        # Calculate aggregated metrics
        total_followers = 0
        total_reach = 0
        total_impressions = 0
        total_engagement = 0
        account_count = 0
        
        # Get unique accounts and their latest metrics
        processed_accounts = set()
        
        for metric in latest_metrics:
            if metric.account_id not in processed_accounts:
                total_followers += metric.followers_count
                total_reach += metric.reach
                total_impressions += metric.impressions
                total_engagement += float(metric.engagement_rate)
                account_count += 1
                processed_accounts.add(metric.account_id)
        
        # Calculate average engagement rate
        avg_engagement = total_engagement / account_count if account_count > 0 else 0
        
        # Calculate growth rate
        previous_month = (current_month.replace(day=1) - timedelta(days=1)).replace(day=1)
        previous_performance = PerformanceData.objects.filter(
            client=client,
            month=previous_month
        ).first()
        
        growth_rate = 0
        if previous_performance and previous_performance.followers > 0:
            growth_rate = ((total_followers - previous_performance.followers) / previous_performance.followers) * 100
        
        # Update or create performance record
        with transaction.atomic():
            performance, created = PerformanceData.objects.update_or_create(
                client=client,
                month=current_month,
                defaults={
                    'followers': total_followers,
                    'engagement': avg_engagement,
                    'reach': total_reach,
                    'impressions': total_impressions,
                    'growth_rate': growth_rate,
                }
            )
        
        logger.info(f"Updated monthly performance for {client.name}: {total_followers} followers, {avg_engagement:.2f}% engagement")
        
        return {
            'status': 'success',
            'client_id': client_id,
            'client_name': client.name,
            'total_followers': total_followers,
            'engagement_rate': avg_engagement,
            'growth_rate': growth_rate,
            'created': created
        }
        
    except Client.DoesNotExist:
        error_msg = f"Client not found: {client_id}"
        logger.error(error_msg)
        return {'status': 'error', 'message': error_msg}
        
    except Exception as exc:
        logger.error(f"Failed to update monthly performance for client {client_id}: {str(exc)}")
        raise self.retry(exc=exc, countdown=120)

@shared_task
def cleanup_old_metrics():
    """Clean up old metrics data to prevent database bloat"""
    try:
        # Keep metrics for last 12 months
        cutoff_date = timezone.now() - timedelta(days=365)
        
        deleted_realtime = RealTimeMetrics.objects.filter(
            created_at__lt=cutoff_date
        ).delete()[0]
        
        deleted_posts = PostMetrics.objects.filter(
            posted_at__lt=cutoff_date
        ).delete()[0]
        
        logger.info(f"Cleaned up old metrics: {deleted_realtime} realtime metrics, {deleted_posts} post metrics")
        
        return {
            'status': 'success',
            'deleted_realtime_metrics': deleted_realtime,
            'deleted_post_metrics': deleted_posts
        }
        
    except Exception as e:
        logger.error(f"Failed to cleanup old metrics: {str(e)}")
        raise

@shared_task
def generate_weekly_reports():
    """Generate weekly performance reports for all active clients"""
    try:
        active_clients = Client.objects.filter(status='active')
        reports_generated = 0
        
        for client in active_clients:
            try:
                # Generate report data
                end_date = timezone.now().date()
                start_date = end_date - timedelta(days=7)
                
                # Get metrics for the week
                weekly_metrics = RealTimeMetrics.objects.filter(
                    account__client=client,
                    date__gte=start_date,
                    date__lte=end_date
                )
                
                if weekly_metrics.exists():
                    # Calculate weekly summary
                    total_followers_gained = sum(
                        metric.daily_growth for metric in weekly_metrics
                    )
                    
                    avg_engagement = sum(
                        float(metric.engagement_rate) for metric in weekly_metrics
                    ) / weekly_metrics.count()
                    
                    total_reach = sum(metric.reach for metric in weekly_metrics)
                    
                    # Here you could send email reports, create notifications, etc.
                    logger.info(f"Generated weekly report for {client.name}: "
                              f"{total_followers_gained} followers gained, "
                              f"{avg_engagement:.2f}% avg engagement")
                    
                    reports_generated += 1
                    
            except Exception as e:
                logger.error(f"Failed to generate report for client {client.name}: {str(e)}")
                continue
        
        logger.info(f"Generated {reports_generated} weekly reports")
        
        return {
            'status': 'success',
            'reports_generated': reports_generated
        }
        
    except Exception as e:
        logger.error(f"Failed to generate weekly reports: {str(e)}")
        raise

# Periodic task configuration (add to settings.py)
"""
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'sync-all-data': {
        'task': 'api.tasks.sync_all_client_data',
        'schedule': crontab(minute=0, hour='*/4'),  # Every 4 hours
    },
    'cleanup-old-metrics': {
        'task': 'api.tasks.cleanup_old_metrics',
        'schedule': crontab(minute=0, hour=2, day_of_week=0),  # Weekly on Sunday at 2 AM
    },
    'generate-weekly-reports': {
        'task': 'api.tasks.generate_weekly_reports',
        'schedule': crontab(minute=0, hour=9, day_of_week=1),  # Monday at 9 AM
    },
}
"""