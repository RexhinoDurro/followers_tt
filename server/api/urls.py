# server/api/urls.py - Complete Fixed URL Configuration
from django.http import JsonResponse
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # Authentication views
    RegisterView, LoginView, logout_view, current_user_view,
    
    # Dashboard stats views
    dashboard_stats_view, client_dashboard_stats_view,
    
    # ViewSets
    ClientViewSet, TaskViewSet, ContentPostViewSet,
    PerformanceDataViewSet, MessageViewSet, InvoiceViewSet,
    FileViewSet, NotificationViewSet, SocialMediaAccountViewSet,
    
    # Real-time metrics
    get_realtime_metrics,
    
    # Analytics views
    analytics_overview, client_performance_report,
    
    # Health check
    health_check
)

from .views.billing_views import (
    get_current_subscription, create_subscription, cancel_subscription,
    create_payment_intent, get_payment_methods, create_setup_intent,
    stripe_webhook, get_admin_billing_settings, delete_admin_account
)

# Import message views
try:
    from .views.message_views import (
        send_message_to_admin, send_message_to_client,
        get_admin_conversations, get_conversation_messages
    )
    MESSAGE_VIEWS_AVAILABLE = True
except ImportError:
    MESSAGE_VIEWS_AVAILABLE = False
    # Create dummy views
    def message_not_available(request, *args, **kwargs):
        return JsonResponse({'error': 'Message functionality not available'}, status=501)
    
    send_message_to_admin = message_not_available
    send_message_to_client = message_not_available
    get_admin_conversations = message_not_available
    get_conversation_messages = message_not_available

# Import OAuth views with error handling
try:
    from .views.oauth_views import (
        initiate_instagram_oauth, handle_instagram_callback,
        initiate_youtube_oauth, handle_youtube_callback,
        get_connected_accounts, disconnect_account,
        trigger_manual_sync, get_sync_status
    )
    OAUTH_ENABLED = True
except ImportError:
    # Fallback if oauth_views doesn't exist
    OAUTH_ENABLED = False
    
    # Create dummy views to prevent URL errors
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

# Create router and register viewsets
router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'content', ContentPostViewSet, basename='content')
router.register(r'performance', PerformanceDataViewSet, basename='performance')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'files', FileViewSet, basename='file')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'social-accounts', SocialMediaAccountViewSet, basename='social-account')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/me/', current_user_view, name='current_user'),
    
    # OAuth endpoints
    path('oauth/instagram/initiate/', initiate_instagram_oauth, name='instagram_oauth_initiate'),
    path('oauth/instagram/callback/', handle_instagram_callback, name='instagram_oauth_callback'),
    path('oauth/youtube/initiate/', initiate_youtube_oauth, name='youtube_oauth_initiate'),
    path('oauth/youtube/callback/', handle_youtube_callback, name='youtube_oauth_callback'),
    
    # Social media account management
    path('social-accounts/', get_connected_accounts, name='connected_accounts'),
    path('social-accounts/<uuid:account_id>/disconnect/', disconnect_account, name='disconnect_account'),
    path('social-accounts/<uuid:account_id>/sync/', trigger_manual_sync, name='trigger_sync'),
    path('social-accounts/<uuid:account_id>/status/', get_sync_status, name='sync_status'),
    
    # Dashboard statistics
    path('dashboard/stats/', dashboard_stats_view, name='dashboard_stats'),
    path('dashboard/client-stats/', client_dashboard_stats_view, name='client_dashboard_stats'),
    
    # Real-time metrics endpoints
    path('metrics/realtime/', get_realtime_metrics, name='realtime_metrics'),
    
    # Billing endpoints
    path('billing/subscription/', get_current_subscription, name='current_subscription'),
    path('billing/create-subscription/', create_subscription, name='create_subscription'),
    path('billing/cancel-subscription/', cancel_subscription, name='cancel_subscription'),
    path('billing/create-payment-intent/', create_payment_intent, name='create_payment_intent'),
    path('billing/payment-methods/', get_payment_methods, name='payment_methods'),
    path('billing/create-setup-intent/', create_setup_intent, name='create_setup_intent'),

    # Stripe webhook
    path('billing/webhook/', stripe_webhook, name='stripe_webhook'),

    # Admin billing
    path('admin/billing-settings/', get_admin_billing_settings, name='admin_billing_settings'),
    path('admin/delete-account/', delete_admin_account, name='delete_admin_account'),

    
    
    # Analytics and reporting
    path('analytics/overview/', analytics_overview, name='analytics_overview'),
    path('analytics/client/<uuid:client_id>/', client_performance_report, name='client_performance_report'),
    
    # Health check
    path('health/', health_check, name='health_check'),
    
    # Message endpoints - Add custom endpoints before the router registration
    path('messages/send-to-admin/', send_message_to_admin, name='send_message_to_admin'),
    path('messages/send-to-client/', send_message_to_client, name='send_message_to_client'),
    path('messages/admin-conversations/', get_admin_conversations, name='admin_conversations'),
    path('messages/conversation/<uuid:user_id>/', get_conversation_messages, name='conversation_messages'),
    
    # Include router URLs - this automatically includes all ViewSet endpoints
    path('', include(router.urls)),
]