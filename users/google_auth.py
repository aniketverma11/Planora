"""
Google OAuth Authentication utilities
"""
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed


def verify_google_token(token):
    """
    Verify Google OAuth token and return user info
    """
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )

        # Verify the issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise AuthenticationFailed('Wrong issuer.')

        # Return user information
        return {
            'email': idinfo.get('email'),
            'first_name': idinfo.get('given_name', ''),
            'last_name': idinfo.get('family_name', ''),
            'google_id': idinfo.get('sub'),
            'picture': idinfo.get('picture', ''),
            'email_verified': idinfo.get('email_verified', False),
        }
    except ValueError as e:
        # Invalid token
        raise AuthenticationFailed(f'Invalid token: {str(e)}')
    except Exception as e:
        raise AuthenticationFailed(f'Token verification failed: {str(e)}')
