from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings

@api_view(['GET'])
@permission_classes([AllowAny])
def test_env(request):
    """Test environment variables"""
    return Response({
        'GOOGLE_CLIENT_ID': getattr(settings, 'GOOGLE_CLIENT_ID', None),
        'YOUTUBE_REDIRECT_URI': getattr(settings, 'YOUTUBE_REDIRECT_URI', None),
        'FRONTEND_URL': getattr(settings, 'FRONTEND_URL', None),
    })
