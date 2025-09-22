# server/api/urls.py - Updated with PayPal billing endpoints
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

# Import auth views
try:
    from .views.auth_views import update_profile, change_password
    AUTH_VIEWS_AVAILABLE = True
except ImportError:
    AUTH_VIEWS_AVAILABLE = False
    def auth_not_available(request, *args, **kwargs):
        return JsonResponse({'error': 'Auth functionality not available'}, status=501)
    
    update_profile = auth_not_available
    change_password = auth_not_available

# Import PayPal billing views - UPDATED for PayPal
from .views.paypal_billing_views import (
    get_available_plans, get_current_subscription, create_subscription,
    approve_subscription, cancel_subscription, update_subscription_plan, 
    capture_payment, create_order, paypal_webhook,
    # Stub functions for compatibility
    pay_invoice_stub, get_payment_methods_stub, create_setup_intent_stub,
    set_default_payment_method_stub, delete_payment_method_stub,
    get_admin_billing_settings_stub, delete_admin_account_stub
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
    OAUTH_ENABLED = False
    
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

# Import message views
try:
    from .views.message_views import (
        send_message_to_admin, send_message_to_client,
        get_admin_conversations, get_conversation_messages
    )
    MESSAGE_VIEWS_AVAILABLE = True
except ImportError:
    MESSAGE_VIEWS_AVAILABLE = False
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
    OAUTH_ENABLED = False
    
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
    path('auth/change-password/', change_password, name='change_password'),
    
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
    
    # PAYPAL BILLING ENDPOINTS - Updated for PayPal
    # Subscription management
    path('billing/plans/', get_available_plans, name='available_plans'),
    path('billing/subscription/', get_current_subscription, name='current_subscription'),
    path('billing/create-subscription/', create_subscription, name='create_subscription'),
    path('billing/approve-subscription/', approve_subscription, name='approve_subscription'),
    path('billing/cancel-subscription/', cancel_subscription, name='cancel_subscription'),
    path('billing/update-subscription-plan/', update_subscription_plan, name='update_subscription_plan'),
    
    # One-time payments
    path('billing/create-order/', create_order, name='create_order'),
    path('billing/capture-payment/', capture_payment, name='capture_payment'),
    
    # Invoice payments (stub for compatibility)
    path('billing/invoices/<uuid:invoice_id>/pay/', pay_invoice_stub, name='pay_invoice'),
    
    # Payment method management (stubs for PayPal compatibility)
    path('billing/payment-methods/', get_payment_methods_stub, name='payment_methods'),
    path('billing/create-setup-intent/', create_setup_intent_stub, name='create_setup_intent'),
    path('billing/payment-methods/<str:payment_method_id>/set-default/', set_default_payment_method_stub, name='set_default_payment_method'),
    path('billing/payment-methods/<str:payment_method_id>/delete/', delete_payment_method_stub, name='delete_payment_method'),

    # PayPal webhook
    path('billing/webhook/', paypal_webhook, name='paypal_webhook'),
    
    # Admin billing and profile endpoints
    path('admin/billing-settings/', get_admin_billing_settings_stub, name='admin_billing_settings'),
    path('admin/delete-account/', delete_admin_account_stub, name='delete_admin_account'),
    
    # Analytics and reporting
    path('analytics/overview/', analytics_overview, name='analytics_overview'),
    path('analytics/client/<uuid:client_id>/', client_performance_report, name='client_performance_report'),
    
    # Health check
    path('health/', health_check, name='health_check'),
    
    # Message endpoints
    path('messages/send-to-admin/', send_message_to_admin, name='send_message_to_admin'),
    path('messages/send-to-client/', send_message_to_client, name='send_message_to_client'),
    path('messages/admin-conversations/', get_admin_conversations, name='admin_conversations'),
    path('messages/conversation/<uuid:user_id>/', get_conversation_messages, name='conversation_messages'),
    
    # Include router URLs
    path('', include(router.urls)),
]