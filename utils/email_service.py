"""
Microsoft Graph API Email Service
Handles email sending through Microsoft Graph API using Azure AD credentials
"""

import msal
import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """
    Service for sending emails via Microsoft Graph API
    """
    
    GRAPH_API_ENDPOINT = 'https://graph.microsoft.com/v1.0'
    
    def __init__(self):
        self.client_id = settings.AZURE_CLIENT_ID
        self.client_secret = settings.AZURE_CLIENT_SECRET
        self.tenant_id = settings.AZURE_TENANT_ID
        self.sender_email = settings.AZURE_SENDER_EMAIL
        
        if not all([self.client_id, self.client_secret, self.tenant_id]):
            logger.error("❌ Azure credentials not configured properly")
            raise ValueError("Azure email credentials are not configured")
    
    def get_access_token(self):
        """
        Get access token using client credentials flow
        """
        try:
            authority = f'https://login.microsoftonline.com/{self.tenant_id}'
            app = msal.ConfidentialClientApplication(
                self.client_id,
                authority=authority,
                client_credential=self.client_secret,
            )
            
            # Request token with Mail.Send permission
            scopes = ['https://graph.microsoft.com/.default']
            result = app.acquire_token_silent(scopes, account=None)
            
            if not result:
                logger.info("🔄 No token in cache, acquiring new token...")
                result = app.acquire_token_for_client(scopes=scopes)
            
            if 'access_token' in result:
                logger.info("✅ Access token acquired successfully")
                return result['access_token']
            else:
                error_msg = result.get('error_description', result.get('error', 'Unknown error'))
                logger.error(f"❌ Failed to acquire token: {error_msg}")
                raise Exception(f"Failed to acquire access token: {error_msg}")
                
        except Exception as e:
            logger.error(f"❌ Error getting access token: {str(e)}")
            raise
    
    def send_email(self, to_email, subject, html_content, cc=None, bcc=None):
        """
        Send email using Microsoft Graph API
        
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
            # Get access token
            token = self.get_access_token()
            
            # Prepare recipients
            if isinstance(to_email, str):
                to_recipients = [{'emailAddress': {'address': to_email}}]
            else:
                to_recipients = [{'emailAddress': {'address': email}} for email in to_email]
            
            # Prepare CC recipients
            cc_recipients = []
            if cc:
                cc_recipients = [{'emailAddress': {'address': email}} for email in cc]
            
            # Prepare BCC recipients
            bcc_recipients = []
            if bcc:
                bcc_recipients = [{'emailAddress': {'address': email}} for email in bcc]
            
            # Prepare email message
            email_msg = {
                'message': {
                    'subject': subject,
                    'body': {
                        'contentType': 'HTML',
                        'content': html_content
                    },
                    'toRecipients': to_recipients,
                }
            }
            
            if cc_recipients:
                email_msg['message']['ccRecipients'] = cc_recipients
            
            if bcc_recipients:
                email_msg['message']['bccRecipients'] = bcc_recipients
            
            # Send email
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            endpoint = f'{self.GRAPH_API_ENDPOINT}/users/{self.sender_email}/sendMail'
            
            logger.info(f"📧 Sending email to {to_email} with subject: {subject}")
            
            response = requests.post(endpoint, headers=headers, json=email_msg)
            
            if response.status_code == 202:
                logger.info(f"✅ Email sent successfully to {to_email}")
                return True
            else:
                logger.error(f"❌ Failed to send email. Status: {response.status_code}, Response: {response.text}")
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
