# server/server/settings.py - Updated with PayPal configuration (replacing Stripe)
from pathlib import Path
import os
from datetime import timedelta
from decouple import config  # pip install python-decouple

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-8c4af#h&cz1xh78%w_%aw%9z(z$40_06xp01%lq$!$n915r9)h')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,0.0.0.0', cast=lambda v: [s.strip() for s in v.split(',')])

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'celery',
    
    # Local apps
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'server.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'server.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ============ PAYPAL CONFIGURATION (replacing Stripe) ============
# PayPal API Configuration
PAYPAL_CLIENT_ID = config('PAYPAL_CLIENT_ID', default='')
PAYPAL_CLIENT_SECRET = config('PAYPAL_CLIENT_SECRET', default='')
PAYPAL_BASE_URL = config('PAYPAL_BASE_URL', default='https://api-m.sandbox.paypal.com')  # Use https://api-m.paypal.com for production
PAYPAL_WEBHOOK_ID = config('PAYPAL_WEBHOOK_ID', default='')

# PayPal Plan IDs (these need to be created in PayPal Dashboard)
PAYPAL_STARTER_PLAN_ID = config('PAYPAL_STARTER_PLAN_ID', default='')
PAYPAL_PRO_PLAN_ID = config('PAYPAL_PRO_PLAN_ID', default='')
PAYPAL_PREMIUM_PLAN_ID = config('PAYPAL_PREMIUM_PLAN_ID', default='')

# PayPal package pricing (for reference)
PAYPAL_PACKAGES = {
    'starter': 100,    # $100/month
    'pro': 250,       # $250/month
    'premium': 400,   # $400/month
}

# For production, use PostgreSQL:
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': config('DB_NAME', default='smma_dashboard'),
#         'USER': config('DB_USER', default='postgres'),
#         'PASSWORD': config('DB_PASSWORD', default=''),
#         'HOST': config('DB_HOST', default='localhost'),
#         'PORT': config('DB_PORT', default='5432'),
#     }
# }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'api.User'

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%S.%fZ',
    'DATE_FORMAT': '%Y-%m-%d',
    'TIME_FORMAT': '%H:%M:%S',
}

# CORS settings for React frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Frontend URL for OAuth redirects
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:3000')

# ============ SOCIAL MEDIA API CONFIGURATION ============
# Instagram/Facebook API
INSTAGRAM_CLIENT_ID = config('INSTAGRAM_CLIENT_ID', default='')
INSTAGRAM_CLIENT_SECRET = config('INSTAGRAM_CLIENT_SECRET', default='')
INSTAGRAM_REDIRECT_URI = config('INSTAGRAM_REDIRECT_URI', default=f"{FRONTEND_URL}/auth/instagram/callback")
FACEBOOK_APP_ID = config('FACEBOOK_APP_ID', default='')
FACEBOOK_APP_SECRET = config('FACEBOOK_APP_SECRET', default='')

# Google/YouTube API
GOOGLE_CLIENT_ID = config('GOOGLE_CLIENT_ID', default='')
GOOGLE_CLIENT_SECRET = config('GOOGLE_CLIENT_SECRET', default='')
YOUTUBE_REDIRECT_URI = config('YOUTUBE_REDIRECT_URI', default=f"{FRONTEND_URL}/auth/youtube/callback")

# TikTok API (when available)
TIKTOK_CLIENT_KEY = config('TIKTOK_CLIENT_KEY', default='')
TIKTOK_CLIENT_SECRET = config('TIKTOK_CLIENT_SECRET', default='')

# Twitter API
TWITTER_API_KEY = config('TWITTER_API_KEY', default='')
TWITTER_API_SECRET = config('TWITTER_API_SECRET', default='')
TWITTER_BEARER_TOKEN = config('TWITTER_BEARER_TOKEN', default='')

# LinkedIn API
LINKEDIN_CLIENT_ID = config('LINKEDIN_CLIENT_ID', default='')
LINKEDIN_CLIENT_SECRET = config('LINKEDIN_CLIENT_SECRET', default='')

# Encryption key for storing access tokens (32 characters)
ENCRYPTION_KEY = config('ENCRYPTION_KEY', default='your-32-character-encryption-key-here')

# ============ REDIS & CACHE CONFIGURATION ============

# Redis connection URL
REDIS_URL = config('REDIS_URL', default='redis://127.0.0.1:6379')

# ============ CELERY CONFIGURATION (Uses Redis) ============

# Celery broker and result backend
CELERY_BROKER_URL = f'{REDIS_URL}/0'  # Database 0 for Celery
CELERY_RESULT_BACKEND = f'{REDIS_URL}/0'
# Celery settings
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes
CELERY_TASK_SOFT_TIME_LIMIT = 25 * 60  # 25 minutes

# Celery Beat Schedule for periodic tasks
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    # Sync all social media data every 4 hours
    'sync-all-data': {
        'task': 'api.tasks.sync_all_client_data',
        'schedule': crontab(minute=0, hour='*/4'),
    },
    # Clean up old metrics weekly
    'cleanup-old-metrics': {
        'task': 'api.tasks.cleanup_old_metrics',
        'schedule': crontab(minute=0, hour=2, day_of_week=0),
    },
    # Generate weekly reports
    'generate-weekly-reports': {
        'task': 'api.tasks.generate_weekly_reports',
        'schedule': crontab(minute=0, hour=9, day_of_week=1),
    },
    # Sync all YouTube accounts every 6 hours
    'sync-youtube-accounts': {
        'task': 'api.tasks.sync_all_youtube_accounts',
        'schedule': crontab(minute=0, hour='*/6'),  # Every 6 hours
    },
    # Sync all Instagram accounts every 4 hours
    'sync-instagram-accounts': {
        'task': 'api.tasks.sync_all_instagram_accounts',
        'schedule': crontab(minute=0, hour='*/4'),  # Every 4 hours
    },
    # Aggregate monthly performance daily at 2 AM
    'aggregate-monthly-performance': {
        'task': 'api.tasks.aggregate_monthly_performance',
        'schedule': crontab(minute=0, hour=2),  # Daily at 2 AM
    },
    # Check overdue invoices daily at 9 AM
    'check-overdue-invoices': {
        'task': 'api.tasks.notification_tasks.check_overdue_invoices',
        'schedule': crontab(hour=9, minute=0),  # Run daily at 9 AM
    },
    # Check upcoming invoice due dates daily at 9 AM
    'check-upcoming-invoices': {
        'task': 'api.tasks.notification_tasks.check_upcoming_invoice_due_dates',
        'schedule': crontab(hour=9, minute=0),  # Run daily at 9 AM
    },
    # Check overdue tasks daily at 9 AM
    'check-overdue-tasks': {
        'task': 'api.tasks.notification_tasks.check_overdue_tasks',
        'schedule': crontab(hour=9, minute=0),  # Run daily at 9 AM
    },
    # Send monthly performance reports on 1st of month at 10 AM
    'send-monthly-reports': {
        'task': 'api.tasks.notification_tasks.send_performance_reports',
        'schedule': crontab(day_of_month=1, hour=10, minute=0),  # 1st of month at 10 AM
    },
}

# ============ CACHE TIMEOUTS ============

CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_SECONDS = 600  # 10 minutes
CACHE_MIDDLEWARE_KEY_PREFIX = 'visionboost_middleware'

# Custom cache timeouts for different data types
CACHE_TIMEOUTS = {
    'verification_code': 600,      # 10 minutes
    'user_session': 3600,          # 1 hour
    'api_response': 300,           # 5 minutes
    'dashboard_stats': 180,        # 3 minutes
    'social_metrics': 900,         # 15 minutes
}

# Cache configuration using Redis
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f'{REDIS_URL}/1',  # Use database 1 for cache
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 50,
                'retry_on_timeout': True,
            },
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
            'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor',
            'IGNORE_EXCEPTIONS': True,  # Don't crash if Redis is down
        },
        'KEY_PREFIX': 'visionboost',
        'TIMEOUT': 300,  # 5 minutes default timeout
    }
}

# Session cache (optional but recommended)
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Use local memory cache for development
if DEBUG:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'unique-snowflake',
        }
    }

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB

# Email settings
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
if not DEBUG:
    EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
    EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
    EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
    EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
    EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
    DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@yoursmma.com')

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'celery': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'celery.log',
            'formatter': 'verbose',
        },
        'paypal': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'paypal.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'api': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'celery': {
            'handlers': ['celery', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'api.payments.paypal_service': {
            'handlers': ['paypal', 'console'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
    },
}


# Create logs directory if it doesn't exist
os.makedirs(BASE_DIR / 'logs', exist_ok=True)

# Session settings
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

# CSRF settings
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Security settings for production
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# API Rate Limiting
API_RATE_LIMITS = {
    'instagram': {
        'calls_per_hour': 200,
        'calls_per_day': 4800,
    },
    'youtube': {
        'calls_per_day': 10000,
    },
    'tiktok': {
        'calls_per_day': 1000,
    },
    'paypal': {
        'calls_per_minute': 50,
        'calls_per_hour': 1000,
    }
}

# Data retention settings
DATA_RETENTION_DAYS = {
    'metrics': 365,  # Keep metrics for 1 year
    'post_metrics': 180,  # Keep post metrics for 6 months
    'sync_logs': 90,  # Keep sync logs for 3 months
    'payment_logs': 2555,  # Keep payment logs for 7 years (compliance)
}

# Webhook settings for real-time updates
WEBHOOK_SECRET = config('WEBHOOK_SECRET', default='your-webhook-secret-key')
WEBHOOK_VERIFY_TOKEN = config('WEBHOOK_VERIFY_TOKEN', default='your-verify-token')

# Feature flags
FEATURES = {
    'ENABLE_INSTAGRAM': True,
    'ENABLE_YOUTUBE': True,
    'ENABLE_TIKTOK': False,  # Enable when TikTok API is available
    'ENABLE_TWITTER': False,
    'ENABLE_LINKEDIN': False,
    'ENABLE_WEBHOOKS': True,
    'ENABLE_REAL_TIME_UPDATES': True,
    'ENABLE_PAYPAL_PAYMENTS': True,
}

# ============ PAYPAL VALIDATION ============
def validate_paypal_config():
    """Validate PayPal configuration on startup"""
    required_settings = [
        'PAYPAL_CLIENT_ID',
        'PAYPAL_CLIENT_SECRET',
        'PAYPAL_BASE_URL',
    ]
    
    missing_settings = []
    for setting in required_settings:
        if not globals().get(setting):
            missing_settings.append(setting)
    
    if missing_settings and not DEBUG:
        print(f"⚠️  Missing PayPal configuration: {', '.join(missing_settings)}")
        print("   PayPal payments will not work until these are configured.")
    elif not missing_settings:
        env_type = "Sandbox" if "sandbox" in PAYPAL_BASE_URL else "Live"
        print(f"✅ PayPal configuration validated ({env_type} environment)")

# Validate configuration on startup (only in production)
if not DEBUG:
    validate_paypal_config()

# ============ DEVELOPMENT OVERRIDES ============
if DEBUG:
    # Development-specific settings
    CORS_ALLOW_ALL_ORIGINS = True
    
    # Console logging only in development
    LOGGING['handlers']['console']['level'] = 'DEBUG'
    
    # Disable CSRF for development API testing
    CSRF_TRUSTED_ORIGINS = [FRONTEND_URL]
    
    # PayPal debug mode
    print("🔧 Development mode: Using PayPal Sandbox")
    if PAYPAL_CLIENT_ID and "sandbox" not in PAYPAL_BASE_URL:
        print("⚠️  Warning: PayPal Client ID suggests sandbox but BASE_URL is not sandbox")

# Production overrides
else:
    # Add production domain to CORS and CSRF settings
    PRODUCTION_DOMAIN = config('PRODUCTION_DOMAIN', default='https://montrose.agency')
    
    CORS_ALLOWED_ORIGINS.extend([
        PRODUCTION_DOMAIN,
        f"{PRODUCTION_DOMAIN.replace('https://', 'https://www.')}"
    ])
    
    CSRF_TRUSTED_ORIGINS.extend([
        PRODUCTION_DOMAIN,
        f"{PRODUCTION_DOMAIN.replace('https://', 'https://www.')}"
    ])
    
    # Ensure PayPal is in live mode for production
    if "sandbox" in PAYPAL_BASE_URL:
        print("⚠️  Warning: Using PayPal Sandbox in production mode")