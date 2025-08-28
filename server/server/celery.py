# server/server/celery.py
import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

# Create the Celery app
app = Celery('server')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Optional: Configure Celery to use Redis as both broker and result backend
app.conf.update(
    task_track_started=True,
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    result_expires=3600,  # 1 hour
    timezone=settings.TIME_ZONE,
    enable_utc=True,
)

# Optional: Add task routes for different queues
app.conf.task_routes = {
    'api.tasks.sync_instagram_data': {'queue': 'instagram'},
    'api.tasks.sync_youtube_data': {'queue': 'youtube'},
    'api.tasks.sync_all_client_data': {'queue': 'sync'},
    'api.tasks.update_client_monthly_performance': {'queue': 'analytics'},
    'api.tasks.cleanup_old_metrics': {'queue': 'maintenance'},
    'api.tasks.generate_weekly_reports': {'queue': 'reports'},
}

@app.task(bind=True)
def debug_task(self):
    """Debug task for testing Celery setup"""
    print(f'Request: {self.request!r}')
    return 'Celery is working!'

