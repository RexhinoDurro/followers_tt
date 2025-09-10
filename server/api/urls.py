# server/api/urls.py - Complete URL configuration
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
    path('/notifications/', NotificationViewSet.as_view, name='notifications'),
    
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
    
    # Analytics and reporting
    path('analytics/overview/', analytics_overview, name='analytics_overview'),
    path('analytics/client/<uuid:client_id>/', client_performance_report, name='client_performance_report'),
    
    # Health check
    path('health/', health_check, name='health_check'),
    
    # Include router URLs
    path('', include(router.urls)),
]