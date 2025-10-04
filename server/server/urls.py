# File: server/server/urls.py
# Main URL Configuration for SMMA Dashboard

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# Serve media files during development
if settings.DEBUG or True:  # Always serve in this setup since we're using Nginx
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)