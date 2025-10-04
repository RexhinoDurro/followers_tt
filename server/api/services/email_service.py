# server/api/services/email_service.py
import resend
import random
import string
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

# Set your Resend API key
resend.api_key = "re_PYMEdAkV_NcpDoviLGnE52nsX5y4wb7jj"

class EmailService:
    """Service for sending emails via Resend"""
    
    @staticmethod
    def generate_verification_code(length=6):
        """Generate a random 6-digit verification code"""
        return ''.join(random.choices(string.digits, k=length))
    
    @staticmethod
    def store_verification_code(email, code, purpose='registration'):
        """Store verification code in cache (expires in 10 minutes)"""
        cache_key = f"verification_{purpose}_{email}"
        cache.set(cache_key, code, timeout=600)  # 10 minutes
        logger.info(f"Stored {purpose} verification code for {email}")
    
    @staticmethod
    def verify_code(email, code, purpose='registration'):
        """Verify if the code matches the stored code"""
        cache_key = f"verification_{purpose}_{email}"
        stored_code = cache.get(cache_key)
        
        if not stored_code:
            logger.warning(f"No verification code found for {email} (purpose: {purpose})")
            return False
        
        is_valid = str(stored_code) == str(code)
        
        if is_valid:
            # Delete the code after successful verification
            cache.delete(cache_key)
            logger.info(f"Verification code validated for {email}")
        else:
            logger.warning(f"Invalid verification code for {email}")
        
        return is_valid
    
    @staticmethod
    def send_verification_email(email, name, code, purpose='registration'):
        """Send verification code email via Resend"""
        try:
            # Store the code
            EmailService.store_verification_code(email, code, purpose)
            
            # Email subject based on purpose
            if purpose == 'registration':
                subject = "Verify Your VisionBoost Account"
                heading = "Welcome to VisionBoost!"
                message = f"Hi {name},<br><br>Thanks for signing up! Use the code below to verify your email and complete your registration."
            else:  # password_reset
                subject = "Reset Your Password - VisionBoost"
                heading = "Password Reset Request"
                message = f"Hi {name},<br><br>We received a request to reset your password. Use the code below to proceed."
            
            # HTML email template
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    .container {{
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 10px;
                        padding: 40px;
                        text-align: center;
                    }}
                    .content {{
                        background: white;
                        border-radius: 8px;
                        padding: 30px;
                        margin-top: 20px;
                    }}
                    h1 {{
                        color: white;
                        margin: 0;
                        font-size: 28px;
                    }}
                    .code {{
                        font-size: 36px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        color: #667eea;
                        background: #f3f4f6;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 30px 0;
                        font-family: 'Courier New', monospace;
                    }}
                    .footer {{
                        margin-top: 30px;
                        font-size: 14px;
                        color: #666;
                    }}
                    .warning {{
                        background: #fef3c7;
                        border-left: 4px solid #f59e0b;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                        text-align: left;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>{heading}</h1>
                    <div class="content">
                        <p>{message}</p>
                        
                        <div class="code">{code}</div>
                        
                        <p>Enter this code in the verification form to continue.</p>
                        
                        <div class="warning">
                            <strong>⏱️ This code expires in 10 minutes.</strong><br>
                            If you didn't request this, please ignore this email.
                        </div>
                        
                        <div class="footer">
                            <p>Best regards,<br>The VisionBoost Team</p>
                            <p style="font-size: 12px; color: #999;">
                                This is an automated email. Please do not reply.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Send email via Resend
            response = resend.Emails.send({
                "from": "VisionBoost <onboarding@visionboost.agency>",
                "to": email,
                "subject": subject,
                "html": html_content
            })
            
            logger.info(f"Verification email sent to {email} via Resend")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send verification email to {email}: {str(e)}")
            raise Exception(f"Failed to send verification email: {str(e)}")
    
    @staticmethod
    def send_welcome_email(email, name):
        """Send welcome email after successful registration"""
        try:
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    .container {{
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 10px;
                        padding: 40px;
                        text-align: center;
                    }}
                    .content {{
                        background: white;
                        border-radius: 8px;
                        padding: 30px;
                        margin-top: 20px;
                    }}
                    h1 {{
                        color: white;
                        margin: 0;
                        font-size: 28px;
                    }}
                    .button {{
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px 30px;
                        border-radius: 8px;
                        text-decoration: none;
                        margin: 20px 0;
                        font-weight: bold;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🎉 Welcome to VisionBoost!</h1>
                    <div class="content">
                        <p>Hi {name},</p>
                        <p>Your account has been successfully created! We're excited to have you on board.</p>
                        <p>You can now log in and start managing your social media presence.</p>
                        <a href="https://visionboost.agency/auth" class="button">Log In to Your Account</a>
                        <p style="margin-top: 30px; font-size: 14px; color: #666;">
                            If you have any questions, feel free to reach out to our support team.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            resend.Emails.send({
                "from": "VisionBoost <welcome@visionboost.agency>",
                "to": email,
                "subject": "Welcome to VisionBoost! 🚀",
                "html": html_content
            })
            
            logger.info(f"Welcome email sent to {email}")
            
        except Exception as e:
            logger.error(f"Failed to send welcome email to {email}: {str(e)}")
            # Don't raise exception for welcome email - it's not critical