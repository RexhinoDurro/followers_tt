# server/api/views/__init__.py - Comprehensive imports from organized view files

# ============ AUTHENTICATION VIEWS ============
from .auth_views import (
    RegisterView, LoginView, logout_view, current_user_view,
    update_profile, change_password
)

# ============ DASHBOARD STATISTICS ============
from .client.statistic_views import (
    dashboard_stats_view, client_dashboard_stats_view,
    analytics_overview, client_performance_report
)

# ============ MAIN VIEWSETS ============
from .client.client_payment import ClientViewSet
from .client.task_views import TaskViewSet
from .client.content_views import ContentPostViewSet
from .client.performance_views import PerformanceDataViewSet
from .admin.invoice_views import InvoiceViewSet
from .client.social_views import SocialMediaAccountViewSet, get_realtime_metrics
from .message_views import MessageViewSet
from .notification_views import NotificationViewSet
from .file_views import FileViewSet

# ============ BANK SETTINGS VIEWS ============
try:
    from .admin.bank_settings_views import (
        admin_bank_settings,
        submit_payment_verification,
        get_pending_verifications,
        approve_payment_verification
    )
    BANK_SETTINGS_AVAILABLE = True
except ImportError:
    BANK_SETTINGS_AVAILABLE = False
    from django.http import JsonResponse
    def bank_not_available(request, *args, **kwargs):
        return JsonResponse({'error': 'Bank settings functionality not available'}, status=501)
    admin_bank_settings = bank_not_available
    submit_payment_verification = bank_not_available
    get_pending_verifications = bank_not_available
    approve_payment_verification = bank_not_available

# ============ MESSAGE VIEWS ============
try:
    from .message_views import (
        send_message_to_admin, send_message_to_client,
        get_admin_conversations, get_conversation_messages
    )
    MESSAGE_VIEWS_AVAILABLE = True
except ImportError:
    MESSAGE_VIEWS_AVAILABLE = False
    from django.http import JsonResponse
    def message_not_available(request, *args, **kwargs):
        return JsonResponse({'error': 'Message functionality not available'}, status=501)
    send_message_to_admin = message_not_available
    send_message_to_client = message_not_available
    get_admin_conversations = message_not_available
    get_conversation_messages = message_not_available

# ============ OAUTH VIEWS ============
try:
    from .oauth_views import (
        initiate_instagram_oauth, handle_instagram_callback,
        initiate_youtube_oauth, handle_youtube_callback,
        get_connected_accounts, disconnect_account,
        trigger_manual_sync, get_sync_status
    )
    OAUTH_VIEWS_AVAILABLE = True
except ImportError:
    OAUTH_VIEWS_AVAILABLE = False
    from django.http import JsonResponse
    def oauth_not_available(request, *args, **kwargs):
        return JsonResponse({'error': 'OAuth functionality not available'}, status=501)
    initiate_instagram_oauth = oauth_not_available
    handle_instagram_callback = oauth_not_available
    initiate_youtube_oauth = oauth_not_available
    handle_youtube_callback = oauth_not_available
    get_connected_accounts = oauth_not_available
    disconnect_account = oauth_not_available
    trigger_manual_sync = oauth_not_available
    get_sync_status = oauth_not_available

# ============ NOTIFICATION VIEWS ============
try:
    from .notification_views import NotificationViewSet as NotificationViewSetFromFile
    NOTIFICATION_VIEWS_AVAILABLE = True
except ImportError:
    NOTIFICATION_VIEWS_AVAILABLE = False
    NotificationViewSetFromFile = None

# ============ FILE VIEWS ============
try:
    from .file_views import FileViewSet as FileViewSetFromFile
    FILE_VIEWS_AVAILABLE = True
except ImportError:
    FILE_VIEWS_AVAILABLE = False
    FileViewSetFromFile = None

# ============ PAYPAL BILLING VIEWS ============
try:
    from .paypal_billing_views import (
        get_available_plans, create_subscription, approve_subscription,
        create_order, capture_payment, paypal_webhook,
        get_current_subscription, cancel_subscription, update_subscription_plan,
        # Stub functions for frontend compatibility
        pay_invoice_stub, get_payment_methods_stub, create_setup_intent_stub,
        set_default_payment_method_stub, delete_payment_method_stub,
        get_admin_billing_settings_stub, delete_admin_account_stub,
    )
    PAYPAL_BILLING_AVAILABLE = True
except ImportError:
    PAYPAL_BILLING_AVAILABLE = False
    from django.http import JsonResponse
    def billing_not_available(request, *args, **kwargs):
        return JsonResponse({'error': 'Billing functionality not available'}, status=501)
    get_available_plans = billing_not_available
    create_subscription = billing_not_available
    approve_subscription = billing_not_available
    create_order = billing_not_available
    capture_payment = billing_not_available
    paypal_webhook = billing_not_available
    get_current_subscription = billing_not_available
    cancel_subscription = billing_not_available
    update_subscription_plan = billing_not_available
    pay_invoice_stub = billing_not_available
    get_payment_methods_stub = billing_not_available
    create_setup_intent_stub = billing_not_available
    set_default_payment_method_stub = billing_not_available
    delete_payment_method_stub = billing_not_available
    get_admin_billing_settings_stub = billing_not_available
    delete_admin_account_stub = billing_not_available

# ============ HEALTH CHECK FUNCTION ============
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status as http_status

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Simple health check endpoint"""
    return Response({
        'status': 'healthy',
        'timestamp': request.META.get('HTTP_DATE', 'unknown'),
        'version': '1.0.0'
    }, status=http_status.HTTP_200_OK)

# ============ EXPORTS ============
__all__ = [
    # Authentication views
    'RegisterView', 'LoginView', 'logout_view', 'current_user_view',
    'update_profile', 'change_password',
    
    # Dashboard stats
    'dashboard_stats_view', 'client_dashboard_stats_view',
    
    # ViewSets
    'ClientViewSet', 'TaskViewSet', 'ContentPostViewSet',
    'PerformanceDataViewSet', 'MessageViewSet', 'InvoiceViewSet',
    'FileViewSet', 'NotificationViewSet', 'SocialMediaAccountViewSet',
    
    # Analytics and metrics  
    'get_realtime_metrics', 'analytics_overview', 'client_performance_report',
    
    # Message functionality
    'send_message_to_admin', 'send_message_to_client',
    'get_admin_conversations', 'get_conversation_messages',
    
    # OAuth functionality
    'initiate_instagram_oauth', 'handle_instagram_callback',
    'initiate_youtube_oauth', 'handle_youtube_callback',
    'get_connected_accounts', 'disconnect_account',
    'trigger_manual_sync', 'get_sync_status',
    
    # PayPal billing
    'get_available_plans', 'create_subscription', 'approve_subscription',
    'create_order', 'capture_payment', 'paypal_webhook',
    'get_current_subscription', 'cancel_subscription', 'update_subscription_plan',
    'pay_invoice_stub', 'get_payment_methods_stub', 'create_setup_intent_stub',
    'set_default_payment_method_stub', 'delete_payment_method_stub',
    'get_admin_billing_settings_stub', 'delete_admin_account_stub',
    
    # Bank settings
    'admin_bank_settings', 'submit_payment_verification',
    'get_pending_verifications', 'approve_payment_verification',
    
    # Health check
    'health_check',
]