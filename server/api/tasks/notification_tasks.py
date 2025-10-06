# server/api/tasks/notification_tasks.py
"""
Celery tasks for sending scheduled notifications
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from ..models import Invoice, Client, Task
from ..services.notification_service import NotificationService
import logging

logger = logging.getLogger(__name__)


@shared_task
def check_overdue_invoices():
    """
    Check for overdue invoices and send notifications
    Run this daily
    """
    try:
        today = timezone.now().date()
        
        # Find invoices that just became overdue (due yesterday)
        overdue_invoices = Invoice.objects.filter(
            status='pending',
            due_date=today - timedelta(days=1)
        ).select_related('client__user')
        
        for invoice in overdue_invoices:
            # Update invoice status
            invoice.status = 'overdue'
            invoice.save()
            
            # Update client payment status
            invoice.client.payment_status = 'overdue'
            invoice.client.save()
            
            # Send notification
            NotificationService.notify_invoice_overdue(
                client_user=invoice.client.user,
                invoice=invoice
            )
        
        logger.info(f"Checked overdue invoices: {overdue_invoices.count()} invoices now overdue")
        return f"Processed {overdue_invoices.count()} overdue invoices"
        
    except Exception as e:
        logger.error(f"Error checking overdue invoices: {e}")
        return f"Error: {str(e)}"


@shared_task
def check_upcoming_invoice_due_dates():
    """
    Check for invoices due in 3 days and send reminders
    Run this daily
    """
    try:
        three_days_from_now = timezone.now().date() + timedelta(days=3)
        
        upcoming_invoices = Invoice.objects.filter(
            status='pending',
            due_date=three_days_from_now
        ).select_related('client__user')
        
        for invoice in upcoming_invoices:
            NotificationService.notify_invoice_due_soon(
                client_user=invoice.client.user,
                invoice=invoice
            )
        
        logger.info(f"Sent reminders for {upcoming_invoices.count()} upcoming invoices")
        return f"Sent {upcoming_invoices.count()} invoice reminders"
        
    except Exception as e:
        logger.error(f"Error checking upcoming invoices: {e}")
        return f"Error: {str(e)}"


@shared_task
def check_overdue_tasks():
    """
    Check for overdue tasks and send notifications
    Run this daily
    """
    try:
        today = timezone.now().date()
        
        # Find tasks that just became overdue (due yesterday)
        overdue_tasks = Task.objects.filter(
            status__in=['pending', 'in-progress'],
            due_date__date=today - timedelta(days=1)
        ).select_related('client__user')
        
        for task in overdue_tasks:
            NotificationService.notify_task_overdue(
                client_user=task.client.user,
                task=task
            )
        
        logger.info(f"Checked overdue tasks: {overdue_tasks.count()} tasks overdue")
        return f"Processed {overdue_tasks.count()} overdue tasks"
        
    except Exception as e:
        logger.error(f"Error checking overdue tasks: {e}")
        return f"Error: {str(e)}"


@shared_task
def send_performance_reports():
    """
    Send monthly performance report notifications
    Run this on the 1st of each month
    """
    try:
        from ..models import RealTimeMetrics
        
        active_clients = Client.objects.filter(status='active').select_related('user')
        
        for client in active_clients:
            # Calculate growth metrics
            latest_metrics = RealTimeMetrics.objects.filter(
                account__client=client
            ).order_by('-date').first()
            
            if latest_metrics:
                NotificationService.notify_monthly_performance_report(
                    client_user=client.user,
                    metrics=latest_metrics
                )
        
        logger.info(f"Sent performance reports to {active_clients.count()} clients")
        return f"Sent {active_clients.count()} performance reports"
        
    except Exception as e:
        logger.error(f"Error sending performance reports: {e}")
        return f"Error: {str(e)}"


@shared_task
def send_subscription_renewal_reminders():
    """
    Send subscription renewal reminders 7 days before expiry
    Run this daily
    """
    try:
        seven_days_from_now = timezone.now().date() + timedelta(days=7)
        
        expiring_clients = Client.objects.filter(
            status='active',
            next_payment=seven_days_from_now
        ).select_related('user')
        
        for client in expiring_clients:
            NotificationService.notify_subscription_renewal_reminder(
                client_user=client.user,
                renewal_date=client.next_payment
            )
        
        logger.info(f"Sent renewal reminders to {expiring_clients.count()} clients")
        return f"Sent {expiring_clients.count()} renewal reminders"
        
    except Exception as e:
        logger.error(f"Error sending renewal reminders: {e}")
        return f"Error: {str(e)}"


