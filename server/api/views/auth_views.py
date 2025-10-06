# server/api/views/auth_views.py - Updated with verification endpoints
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import authenticate, update_session_auth_hash
import logging

from ..serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer
)
from ..models import User
from ..services.notification_service import NotificationService

logger = logging.getLogger(__name__)

# Import email service
try:
    from ..services.email_service import EmailService
    EMAIL_SERVICE_AVAILABLE = True
except ImportError:
    EMAIL_SERVICE_AVAILABLE = False
    logger.warning("Email service not available")


# ============ NEW: VERIFICATION CODE ENDPOINTS ============

@api_view(['POST'])
@permission_classes([AllowAny])
def send_verification_code(request):
    """Send verification code to email for registration"""
    try:
        email = request.data.get('email')
        name = request.data.get('name', 'User')
        purpose = request.data.get('purpose', 'registration')  # 'registration' or 'password_reset'
        
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate email format
        import re
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return Response(
                {'error': 'Invalid email format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if email already exists (for registration only)
        if purpose == 'registration':
            if User.objects.filter(email=email).exists():
                return Response(
                    {'error': 'An account with this email already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Check if user exists (for password reset only)
        if purpose == 'password_reset':
            if not User.objects.filter(email=email).exists():
                # Don't reveal if email exists for security
                # But still return success
                return Response({
                    'success': True,
                    'message': 'If an account exists with this email, a verification code has been sent.'
                })
        
        if not EMAIL_SERVICE_AVAILABLE:
            # For testing: return a dummy code
            return Response({
                'success': True,
                'message': 'Verification code sent',
                'test_code': '123456'  # Remove in production!
            })
        
        # Generate and send verification code
        code = EmailService.generate_verification_code()
        EmailService.send_verification_email(email, name, code, purpose)
        
        logger.info(f"Verification code sent to {email} for {purpose}")
        
        return Response({
            'success': True,
            'message': 'Verification code sent to your email',
            'expires_in': 600  # 10 minutes
        })
        
    except Exception as e:
        logger.error(f"Error sending verification code: {str(e)}")
        return Response(
            {'error': 'Failed to send verification code. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_and_register(request):
    """Verify code and create user account"""
    try:
        email = request.data.get('email')
        verification_code = request.data.get('verification_code')
        password = request.data.get('password')
        name = request.data.get('name')
        company = request.data.get('company', '')
        role = request.data.get('role', 'client')
        
        # Validate required fields
        if not all([email, verification_code, password, name]):
            return Response(
                {'error': 'Email, verification code, password, and name are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify the code
        if EMAIL_SERVICE_AVAILABLE:
            is_valid = EmailService.verify_code(email, verification_code, 'registration')
            if not is_valid:
                return Response(
                    {'error': 'Invalid or expired verification code'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # For testing: accept 123456
            if verification_code != '123456':
                return Response(
                    {'error': 'Invalid verification code'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'An account with this email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the user
        registration_data = {
            'email': email,
            'password': password,
            'name': name,
            'role': role,
            'company': company
        }
        
        serializer = UserRegistrationSerializer(data=registration_data)
        
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            
            # 🔔 NEW: Notify admins of new user registration
            NotificationService.notify_new_user_registered(user)
            
            # Send welcome email (non-blocking)
            if EMAIL_SERVICE_AVAILABLE:
                try:
                    EmailService.send_welcome_email(email, name)
                except Exception as e:
                    logger.error(f"Failed to send welcome email: {e}")
            
            logger.info(f"User {email} successfully registered and verified")
            
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'Account created successfully!'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Error in verify_and_register: {str(e)}")
        return Response(
            {'error': 'Failed to create account. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification_code(request):
    """Resend verification code"""
    try:
        email = request.data.get('email')
        name = request.data.get('name', 'User')
        purpose = request.data.get('purpose', 'registration')
        
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not EMAIL_SERVICE_AVAILABLE:
            return Response({
                'success': True,
                'message': 'Verification code sent',
                'test_code': '123456'
            })
        
        # Generate and send new code
        code = EmailService.generate_verification_code()
        EmailService.send_verification_email(email, name, code, purpose)
        
        logger.info(f"Verification code resent to {email}")
        
        return Response({
            'success': True,
            'message': 'Verification code resent to your email'
        })
        
    except Exception as e:
        logger.error(f"Error resending verification code: {str(e)}")
        return Response(
            {'error': 'Failed to resend code. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============ EXISTING ENDPOINTS (keep these) ============

class RegisterView(generics.CreateAPIView):
    """User registration view - DEPRECATED: Use verify_and_register instead"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        
        # 🔔 NEW: Notify admins of new user registration
        NotificationService.notify_new_user_registered(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """User login view"""
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout view"""
    try:
        request.user.auth_token.delete()
    except:
        pass
    return Response({'message': 'Successfully logged out'})


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def current_user_view(request):
    """Get or update current user profile"""
    if request.method == 'GET':
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        try:
            user = request.user
            
            # Handle avatar upload separately
            if 'avatar' in request.FILES:
                if user.avatar:
                    try:
                        user.avatar.delete(save=False)
                    except:
                        pass
                user.avatar = request.FILES['avatar']
                user.save()
            
            # Update other fields
            data = {k: v for k, v in request.data.items() if k != 'avatar'}
            serializer = UserSerializer(user, data=data, partial=True, context={'request': request})
            
            if serializer.is_valid():
                serializer.save()
                return Response(UserSerializer(user, context={'request': request}).data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Profile update error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def update_profile(request):
    """Update user profile including avatar"""
    try:
        user = request.user
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        if 'avatar' in request.FILES:
            if user.avatar:
                try:
                    user.avatar.delete(save=False)
                except:
                    pass
            user.avatar = request.FILES['avatar']
            user.save()
            if 'avatar' in data:
                del data['avatar']
        
        serializer = UserSerializer(user, data=data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    try:
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response(
                {'error': 'Both current and new password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 8:
            return Response(
                {'error': 'New password must be at least 8 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        update_session_auth_hash(request, user)
        
        return Response({'message': 'Password changed successfully'})
        
    except Exception as e:
        logger.error(f"Password change error: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)