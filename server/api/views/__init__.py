# server/api/views/__init__.py - Fixed imports

# Import all views from views.py
from .views import (
    RegisterView, LoginView, logout_view, current_user_view,
    dashboard_stats_view, client_dashboard_stats_view,
    ClientViewSet, TaskViewSet, ContentPostViewSet,
    PerformanceDataViewSet, MessageViewSet, InvoiceViewSet,
    FileViewSet, NotificationViewSet, SocialMediaAccountViewSet,
    get_realtime_metrics,
    analytics_overview, client_performance_report,
    health_check
)

# Import message views if available
try:
    from .message_views import (
        send_message_to_admin, send_message_to_client,
        get_admin_conversations, get_conversation_messages
    )
    MESSAGE_VIEWS_AVAILABLE = True
except ImportError:
    # Message views not available
    MESSAGE_VIEWS_AVAILABLE = False
    pass

# Import OAuth views if available (they're imported in urls.py)
try:
    from .oauth_views import (
        initiate_instagram_oauth, handle_instagram_callback,
        initiate_youtube_oauth, handle_youtube_callback,
        get_connected_accounts, disconnect_account,
        trigger_manual_sync, get_sync_status
    )
except ImportError:
    # OAuth views are handled in urls.py
    pass

__all__ = [
    'RegisterView', 'LoginView', 'logout_view', 'current_user_view',
    'dashboard_stats_view', 'client_dashboard_stats_view',
    'ClientViewSet', 'TaskViewSet', 'ContentPostViewSet',
    'PerformanceDataViewSet', 'MessageViewSet', 'InvoiceViewSet',
    'FileViewSet', 'NotificationViewSet', 'SocialMediaAccountViewSet',
    'get_realtime_metrics',
    'analytics_overview', 'client_performance_report',
    'health_check'
]

if MESSAGE_VIEWS_AVAILABLE:
    __all__.extend([
        'send_message_to_admin', 'send_message_to_client',
        'get_admin_conversations', 'get_conversation_messages'
    ])