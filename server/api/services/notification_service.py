# server/api/services/notification_service.py
"""
Notification service for sending various types of notifications
"""
from django.contrib.auth import get_user_model
from ..models import Notification
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing notifications"""
    
    @staticmethod
    def create_notification(user, title, message, notification_type='general'):
        """Create a notification for a user"""
        try:
            notification = Notification.objects.create(
                user=user,
                title=title,
                message=message,
                notification_type=notification_type
            )
            logger.info(f"Notification created for user {user.email}: {title}")
            return notification
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            return None
    
    # Content-related notifications
    @staticmethod
    def notify_content_submitted(content_post):
        """Notify admins when client submits content"""
        admin_users = User.objects.filter(role='admin')
        for admin in admin_users:
            NotificationService.create_notification(
                user=admin,
                title="New Content Submitted 📝",
                message=f"Client {content_post.client.name} submitted content: '{content_post.caption[:50]}...' for review.",
                notification_type='content_submitted'
            )
    
    @staticmethod
    def notify_content_approved(client_user, content_post):
        """Notify client when content is approved"""
        NotificationService.create_notification(
            user=client_user,
            title="Content Approved ✅",
            message=f"Your content '{content_post.caption[:50]}...' has been approved and is ready for posting!",
            notification_type='content_approved'
        )
    
    @staticmethod
    def notify_content_rejected(client_user, content_post, feedback=""):
        """Notify client when content needs revision"""
        message = f"Your content '{content_post.caption[:50]}...' needs revision."
        if feedback:
            message += f" Feedback: {feedback}"
        
        NotificationService.create_notification(
            user=client_user,
            title="Content Needs Revision 📝",
            message=message,
            notification_type='content_rejected'
        )
    
    @staticmethod
    def notify_content_posted(client_user, content_post):
        """Notify client when content is posted"""
        NotificationService.create_notification(
            user=client_user,
            title="Content Posted! 🚀",
            message=f"Your content has been posted successfully! Check it out at: {content_post.post_url}",
            notification_type='content_posted'
        )
    
    # Message notifications
    @staticmethod
    def notify_message_to_admin(sender_name):
        """Notify admins of new message"""
        admin_users = User.objects.filter(role='admin')
        for admin in admin_users:
            NotificationService.create_notification(
                user=admin,
                title="New Message 💬",
                message=f"You have a new message from {sender_name}",
                notification_type='message_received'
            )
    
    @staticmethod
    def notify_message_received(recipient_user, sender_name):
        """Notify user of new message"""
        NotificationService.create_notification(
            user=recipient_user,
            title="New Message 💬",
            message=f"You have a new message from {sender_name}",
            notification_type='message_received'
        )
    
    # User registration notifications
    @staticmethod
    def notify_new_user_registered(user):
        """Notify admins of new user registration"""
        admin_users = User.objects.filter(role='admin')
        for admin in admin_users:
            NotificationService.create_notification(
                user=admin,
                title="New User Registered 👋",
                message=f"New user {user.first_name or user.email} has registered with role: {user.role}",
                notification_type='user_registered'
            )
    
    # Invoice notifications
    @staticmethod
    def notify_invoice_created(client_user, invoice):
        """Notify client of new invoice"""
        NotificationService.create_notification(
            user=client_user,
            title="New Invoice 💰",
            message=f"A new invoice for ${invoice.amount} has been generated. Due date: {invoice.due_date.strftime('%B %d, %Y')}",
            notification_type='invoice_created'
        )
    
    @staticmethod
    def notify_invoice_overdue(client_user, invoice):
        """Notify client of overdue invoice"""
        NotificationService.create_notification(
            user=client_user,
            title="Invoice Overdue ⚠️",
            message=f"Invoice #{invoice.id} for ${invoice.amount} is now overdue. Please pay as soon as possible.",
            notification_type='invoice_overdue'
        )
    
    @staticmethod
    def notify_invoice_due_soon(client_user, invoice):
        """Notify client of upcoming due date"""
        NotificationService.create_notification(
            user=client_user,
            title="Invoice Due Soon 📅",
            message=f"Reminder: Invoice #{invoice.id} for ${invoice.amount} is due in 3 days ({invoice.due_date.strftime('%B %d, %Y')}).",
            notification_type='invoice_reminder'
        )
    
    @staticmethod
    def notify_payment_received(client_user, invoice):
        """Notify client that payment was received"""
        NotificationService.create_notification(
            user=client_user,
            title="Payment Received ✅",
            message=f"Thank you! Your payment of ${invoice.amount} has been received and processed.",
            notification_type='payment_received'
        )
    
    # Subscription notifications
    @staticmethod
    def notify_subscription_activated(client_user, plan_name):
        """Notify client that subscription is activated"""
        NotificationService.create_notification(
            user=client_user,
            title="Subscription Activated! 🎉",
            message=f"Welcome! Your {plan_name} subscription is now active. Let's grow your social media presence!",
            notification_type='subscription_activated'
        )
    
    @staticmethod
    def notify_subscription_created(client, plan_name):
        """Notify admins of new subscription"""
        admin_users = User.objects.filter(role='admin')
        for admin in admin_users:
            NotificationService.create_notification(
                user=admin,
                title="New Subscription Created 💼",
                message=f"Client {client.name} has subscribed to {plan_name}",
                notification_type='subscription_created'
            )
    
    @staticmethod
    def notify_subscription_cancelled(client_user):
        """Notify client that subscription was cancelled"""
        NotificationService.create_notification(
            user=client_user,
            title="Subscription Cancelled",
            message="Your subscription has been cancelled. We're sorry to see you go! Contact us if you have any questions.",
            notification_type='subscription_cancelled'
        )
    
    @staticmethod
    def notify_client_cancelled_subscription(client):
        """Notify admins when client cancels subscription"""
        admin_users = User.objects.filter(role='admin')
        for admin in admin_users:
            NotificationService.create_notification(
                user=admin,
                title="Client Cancelled Subscription",
                message=f"Client {client.name} has cancelled their subscription.",
                notification_type='subscription_cancelled'
            )
    
    @staticmethod
    def notify_subscription_renewal_reminder(client_user, renewal_date):
        """Notify client about upcoming renewal"""
        NotificationService.create_notification(
            user=client_user,
            title="Subscription Renewal Reminder 🔄",
            message=f"Your subscription will renew on {renewal_date.strftime('%B %d, %Y')}. Make sure your payment method is up to date!",
            notification_type='subscription_renewal'
        )
    
    # Payment verification notifications
    @staticmethod
    def notify_payment_verification_submitted(client, amount, plan):
        """Notify admins of payment verification submission"""
        admin_users = User.objects.filter(role='admin')
        for admin in admin_users:
            NotificationService.create_notification(
                user=admin,
                title="Payment Verification Submitted 💳",
                message=f"Client {client.name} submitted payment verification for {plan} plan (${amount})",
                notification_type='payment_verification'
            )
    
    # Task notifications
    @staticmethod
    def notify_task_overdue(client_user, task):
        """Notify client of overdue task"""
        NotificationService.create_notification(
            user=client_user,
            title="Task Overdue ⚠️",
            message=f"Task '{task.title}' is now overdue. Due date was {task.due_date.strftime('%B %d, %Y')}.",
            notification_type='task_overdue'
        )
    
    # Performance notifications
    @staticmethod
    def notify_monthly_performance_report(client_user, metrics):
        """Send monthly performance report"""
        growth_message = f"Your account grew by {metrics.daily_growth} followers this month! "
        growth_message += f"Current total: {metrics.followers_count} followers with {metrics.engagement_rate}% engagement."
        
        NotificationService.create_notification(
            user=client_user,
            title="Monthly Performance Report 📊",
            message=growth_message,
            notification_type='performance_update'
        )