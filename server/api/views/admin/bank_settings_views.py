# server/api/views/admin/bank_settings_views.py - Updated with Plan Selection

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import logging

from ...models import AdminBankSettings, PaymentVerification, Client
from ...services.notification_service import NotificationService

logger = logging.getLogger(__name__)

# Plan configurations matching frontend
PLAN_CONFIGS = {
    'starter': {
        'name': 'Starter Plan',
        'monthly_fee': 100,
        'package': 'Starter Plan'
    },
    'pro': {
        'name': 'Pro Plan',
        'monthly_fee': 250,
        'package': 'Pro Plan'
    },
    'premium': {
        'name': 'Premium Plan',
        'monthly_fee': 400,
        'package': 'Premium Plan'
    }
}


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_bank_settings(request):
    """Get or update admin bank settings"""
    
    if request.method == 'GET':
        # Anyone can view bank settings
        settings = AdminBankSettings.objects.filter(is_active=True).first()
        
        if not settings:
            return Response({
                'admin_full_name': '',
                'iban': '',
                'bank_name': '',
                'swift_code': '',
                'additional_info': '',
                'configured': False
            })
        
        return Response({
            'id': str(settings.id),
            'admin_full_name': settings.admin_full_name,
            'iban': settings.iban,
            'bank_name': settings.bank_name,
            'swift_code': settings.swift_code,
            'additional_info': settings.additional_info,
            'configured': True,
            'updated_at': settings.updated_at
        })
    
    elif request.method == 'POST':
        # Only admin can update
        if request.user.role != 'admin':
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            admin_full_name = request.data.get('admin_full_name', '').strip()
            iban = request.data.get('iban', '').strip()
            bank_name = request.data.get('bank_name', '').strip()
            swift_code = request.data.get('swift_code', '').strip()
            additional_info = request.data.get('additional_info', '').strip()
            
            if not admin_full_name or not iban:
                return Response(
                    {'error': 'Admin full name and IBAN are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create settings
            settings, created = AdminBankSettings.objects.get_or_create(
                is_active=True,
                defaults={
                    'admin_full_name': admin_full_name,
                    'iban': iban,
                    'bank_name': bank_name,
                    'swift_code': swift_code,
                    'additional_info': additional_info
                }
            )
            
            if not created:
                # Update existing
                settings.admin_full_name = admin_full_name
                settings.iban = iban
                settings.bank_name = bank_name
                settings.swift_code = swift_code
                settings.additional_info = additional_info
                settings.save()
            
            logger.info(f"Admin {request.user.email} updated bank settings")
            
            return Response({
                'success': True,
                'message': 'Bank settings updated successfully',
                'admin_full_name': settings.admin_full_name,
                'iban': settings.iban
            })
            
        except Exception as e:
            logger.error(f"Error updating bank settings: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_payment_verification(request):
    """Submit payment verification for bank transfer"""
    try:
        if request.user.role != 'client':
            return Response(
                {'error': 'Client access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        client = request.user.client_profile
        client_full_name = request.data.get('client_full_name', '').strip()
        plan = request.data.get('plan', '')
        amount = request.data.get('amount', 0)
        
        if not client_full_name:
            return Response(
                {'error': 'Your full name is required for verification'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not plan or not amount:
            return Response(
                {'error': 'Plan and amount are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create verification record
        verification = PaymentVerification.objects.create(
            client=client,
            plan=plan,
            amount=amount,
            client_full_name=client_full_name,
            status='pending'
        )
        
        # Update client status to pending (but don't activate yet)
        client.status = 'pending'
        client.payment_status = 'pending'
        client.save()
        
        # 🔔 NEW: Notify admins of payment verification submission
        NotificationService.notify_payment_verification_submitted(
            client=client,
            amount=amount,
            plan=plan
        )
        
        logger.info(f"Payment verification submitted for client {client.name}")
        
        return Response({
            'success': True,
            'verification_id': str(verification.id),
            'message': 'Payment verification submitted successfully',
            'status': 'pending'
        })
        
    except Exception as e:
        logger.error(f"Error submitting payment verification: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_verifications(request):
    """Get pending payment verifications (admin only)"""
    if request.user.role != 'admin':
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    verifications = PaymentVerification.objects.filter(
        status='pending'
    ).select_related('client', 'client__user')
    
    data = []
    for v in verifications:
        data.append({
            'id': str(v.id),
            'client_name': v.client.name,
            'client_email': v.client.email,
            'client_full_name': v.client_full_name,
            'plan': v.plan,
            'amount': float(v.amount),
            'submitted_at': v.submitted_at,
            'status': v.status
        })
    
    return Response({'verifications': data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_payment_verification(request, verification_id):
    """Approve payment verification with plan selection (admin only)"""
    if request.user.role != 'admin':
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        verification = PaymentVerification.objects.get(id=verification_id)
        plan_id = request.data.get('plan_id', '').lower()
        
        if not plan_id or plan_id not in PLAN_CONFIGS:
            return Response(
                {'error': f'Invalid plan. Must be one of: {", ".join(PLAN_CONFIGS.keys())}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get plan configuration
        plan_config = PLAN_CONFIGS[plan_id]
        
        # Update verification status
        verification.status = 'approved'
        verification.approved_at = timezone.now()
        verification.approved_by = request.user
        verification.save()
        
        # Update client with selected plan
        client = verification.client
        client.status = 'active'
        client.payment_status = 'paid'
        client.current_plan = plan_id
        client.package = plan_config['package']
        client.monthly_fee = plan_config['monthly_fee']
        client.subscription_start_date = timezone.now()
        
        # Set next payment date (1 month from now)
        from datetime import timedelta
        client.next_payment = timezone.now().date() + timedelta(days=30)
        
        # Update total spent
        client.total_spent += verification.amount
        
        client.save()
        
        # 🔔 NEW: Notify client that subscription is activated
        NotificationService.notify_subscription_activated(
            client_user=client.user,
            plan_name=plan_config['name']
        )
        
        # 🔔 NEW: Notify admins of new subscription
        NotificationService.notify_subscription_created(
            client=client,
            plan_name=plan_config['name']
        )
        
        logger.info(f"Payment verification approved for client {client.name} - Plan: {plan_config['name']}")
        
        return Response({
            'success': True,
            'message': f'Payment verification approved. Client activated with {plan_config["name"]}',
            'client_id': str(client.id),
            'plan': plan_config['name'],
            'monthly_fee': plan_config['monthly_fee']
        })
        
    except PaymentVerification.DoesNotExist:
        return Response(
            {'error': 'Verification not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error approving verification: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )