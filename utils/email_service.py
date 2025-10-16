"""
SendinBlue (Brevo) SDK Email Service
Handles email sending through SendinBlue Python SDK
"""

import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """
    Service for sending emails via SendinBlue (Brevo) Python SDK
    """
    
    def __init__(self):
        self.api_key = settings.SENDINBLUE_API_KEY
        self.sender_email = settings.SENDER_EMAIL
        self.sender_name = settings.SENDER_NAME
        
        if not self.api_key:
            logger.error("❌ SendinBlue API key not configured properly")
            raise ValueError("SendinBlue API key is not configured")
        
        # Configure SDK
        self.configuration = sib_api_v3_sdk.Configuration()
        self.configuration.api_key['api-key'] = self.api_key
        
        # Create API client
        self.api_client = sib_api_v3_sdk.ApiClient(self.configuration)
        self.api_instance = sib_api_v3_sdk.TransactionalEmailsApi(self.api_client)
    
    def send_email(self, to_email, subject, html_content, cc=None, bcc=None):
        """
        Send email using SendinBlue SDK
        
        Args:
            to_email (str or list): Recipient email address(es)
            subject (str): Email subject
            html_content (str): HTML email content
            cc (list, optional): CC recipients
            bcc (list, optional): BCC recipients
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            # Prepare recipients
            if isinstance(to_email, str):
                to_recipients = [sib_api_v3_sdk.SendSmtpEmailTo(email=to_email)]
            else:
                to_recipients = [sib_api_v3_sdk.SendSmtpEmailTo(email=email) for email in to_email]
            
            # Prepare CC recipients
            cc_recipients = []
            if cc:
                cc_recipients = [sib_api_v3_sdk.SendSmtpEmailCc(email=email) for email in cc]
            
            # Prepare BCC recipients
            bcc_recipients = []
            if bcc:
                bcc_recipients = [sib_api_v3_sdk.SendSmtpEmailBcc(email=email) for email in bcc]
            
            # Create email object
            email_data = sib_api_v3_sdk.SendSmtpEmail(
                sender=sib_api_v3_sdk.SendSmtpEmailSender(
                    name=self.sender_name,
                    email=self.sender_email
                ),
                to=to_recipients,
                subject=subject,
                html_content=html_content
            )
            
            # Add CC if provided
            if cc_recipients:
                email_data.cc = cc_recipients
            
            # Add BCC if provided
            if bcc_recipients:
                email_data.bcc = bcc_recipients
            
            logger.info(f"📧 Sending email to {to_email} with subject: {subject}")
            
            # Send email using SDK
            api_response = self.api_instance.send_transac_email(email_data)
            
            logger.info(f"✅ Email sent successfully to {to_email}")
            logger.info(f"📧 Message ID: {api_response.message_id}")
            return True
                
        except ApiException as e:
            logger.error(f"❌ SendinBlue API Exception: {e}")
            logger.error(f"Status Code: {e.status}")
            logger.error(f"Reason: {e.reason}")
            logger.error(f"Body: {e.body}")
            
            # Handle specific error cases
            if e.status == 401:
                logger.error("🔐 IP Authorization Issue: Add your IP to SendinBlue authorized IPs")
            elif e.status == 400:
                logger.error("📧 Invalid email data - check sender/recipient emails")
            elif e.status == 402:
                logger.error("💳 Billing issue - check your SendinBlue account")
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Error sending email: {str(e)}")
            return False
    
    def send_bulk_emails(self, email_list):
        """
        Send multiple emails
        
        Args:
            email_list (list): List of dicts with 'to_email', 'subject', 'html_content'
            
        Returns:
            dict: Results with success/failed counts
        """
        results = {'success': 0, 'failed': 0, 'errors': []}
        
        for email_data in email_list:
            success = self.send_email(
                to_email=email_data.get('to_email'),
                subject=email_data.get('subject'),
                html_content=email_data.get('html_content'),
                cc=email_data.get('cc'),
                bcc=email_data.get('bcc')
            )
            
            if success:
                results['success'] += 1
            else:
                results['failed'] += 1
                results['errors'].append({
                    'to_email': email_data.get('to_email'),
                    'subject': email_data.get('subject')
                })
        
        return results


# Create singleton instance
email_service = EmailService()
