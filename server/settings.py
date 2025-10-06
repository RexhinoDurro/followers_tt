# Add to your CELERY configuration

from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'check-overdue-invoices': {
        'task': 'api.tasks.notification_tasks.check_overdue_invoices',
        'schedule': crontab(hour=9, minute=0),  # Run daily at 9 AM
    },
    'check-upcoming-invoices': {
        'task': 'api.tasks.notification_tasks.check_upcoming_invoice_due_dates',
        'schedule': crontab(hour=9, minute=0),  # Run daily at 9 AM
    },
    'check-overdue-tasks': {
        'task': 'api.tasks.notification_tasks.check_overdue_tasks',
        'schedule': crontab(hour=9, minute=0),  # Run daily at 9 AM
    },
    'send-monthly-reports': {
        'task': 'api.tasks.notification_tasks.send_performance_reports',
        'schedule': crontab(day_of_month=1, hour=10, minute=0),  # 1st of month at 10 AM
    },
    'send-renewal-reminders': {
        'task': 'api.tasks.notification_tasks.send_subscription_renewal_reminders',
        'schedule': crontab(hour=10, minute=0),  # Run daily at 10 AM
    },
}

CELERY_TIMEZONE = 'UTC'
