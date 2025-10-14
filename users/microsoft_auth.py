"""
Microsoft Authentication Utilities
Handles Microsoft OAuth token verification using MSAL
"""
import msal
import requests
from django.conf import settings
from decouple import config


def verify_microsoft_token(token):
    """
    Verify Microsoft OAuth token and return user information.
    
    Args:
        token (str): Microsoft OAuth access token
        
    Returns:
        dict: User information including email, name, etc.
        
    Raises:
        Exception: If token verification fails
    """
    try:
        # Get user info from Microsoft Graph API
        graph_url = 'https://graph.microsoft.com/v1.0/me'
        headers = {
            'Authorization': f'Bearer {token}'
        }
        
        response = requests.get(graph_url, headers=headers)
        
        if response.status_code != 200:
            raise Exception(f'Failed to get user info: {response.text}')
        
        user_info = response.json()
        
        # Return standardized user information
        return {
            'email': user_info.get('mail') or user_info.get('userPrincipalName'),
            'name': user_info.get('displayName', ''),
            'given_name': user_info.get('givenName', ''),
            'family_name': user_info.get('surname', ''),
            'microsoft_id': user_info.get('id'),
            'verified_email': True  # Microsoft accounts are verified
        }
        
    except requests.exceptions.RequestException as e:
        raise Exception(f'Error verifying Microsoft token: {str(e)}')
    except Exception as e:
        raise Exception(f'Error processing Microsoft token: {str(e)}')


def get_microsoft_auth_url():
    """
    Generate Microsoft OAuth authorization URL.
    
    Returns:
        str: Authorization URL for redirecting users
    """
    client_id = config('MICROSOFT_CLIENT_ID', default='')
    tenant_id = config('MICROSOFT_TENANT_ID', default='common')
    redirect_uri = config('MICROSOFT_REDIRECT_URI', default='http://localhost:3000')
    
    authority = f'https://login.microsoftonline.com/{tenant_id}'
    
    app = msal.ConfidentialClientApplication(
        client_id,
        authority=authority,
        client_credential=config('MICROSOFT_CLIENT_SECRET', default='')
    )
    
    scopes = ['User.Read']
    
    auth_url = app.get_authorization_request_url(
        scopes,
        redirect_uri=redirect_uri
    )
    
    return auth_url
