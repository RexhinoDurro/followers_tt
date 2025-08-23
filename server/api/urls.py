# File: server/api/urls.py
# URL Configuration for SMMA Dashboard API

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
    FileViewSet, NotificationViewSet,
    
    # Analytics views
    analytics_overview, client_performance_report,
    
    # Health check
    health_check
)

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

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/me/', current_user_view, name='current_user'),
    
    # Dashboard statistics
    path('dashboard/stats/', dashboard_stats_view, name='dashboard_stats'),
    path('dashboard/client-stats/', client_dashboard_stats_view, name='client_dashboard_stats'),
    
    # Analytics and reporting
    path('analytics/overview/', analytics_overview, name='analytics_overview'),
    path('analytics/client/<uuid:client_id>/', client_performance_report, name='client_performance_report'),
    
    # Health check
    path('health/', health_check, name='health_check'),
    
    # Include router URLs
    path('', include(router.urls)),
]