from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer
from .models import CustomUser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import permissions
from .google_auth import verify_google_token
from django.contrib.auth.hashers import make_password
import secrets

class SignUpView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

class LoginView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)

class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)


class GoogleAuthView(APIView):
    """
    Handle Google OAuth authentication
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        try:
            token = request.data.get('token')
            if not token:
                return Response(
                    {'error': 'Token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify the Google token and get user info
            user_info = verify_google_token(token)

            # Check if user exists with this Google ID
            user = CustomUser.objects.filter(google_id=user_info['google_id']).first()

            if user:
                # User exists, log them in
                if not user.is_active:
                    return Response(
                        {'error': 'User account is disabled'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                # Check if user exists with this email (from regular signup)
                user = CustomUser.objects.filter(email=user_info['email']).first()
                
                if user:
                    # Link Google account to existing user
                    user.google_id = user_info['google_id']
                    user.auth_provider = 'google'
                    user.profile_picture = user_info.get('picture', '')
                    user.save()
                else:
                    # Create new user
                    username = user_info['email'].split('@')[0]
                    base_username = username
                    counter = 1
                    
                    # Ensure unique username
                    while CustomUser.objects.filter(username=username).exists():
                        username = f"{base_username}{counter}"
                        counter += 1

                    user = CustomUser.objects.create(
                        username=username,
                        email=user_info['email'],
                        first_name=user_info.get('first_name', ''),
                        last_name=user_info.get('last_name', ''),
                        google_id=user_info['google_id'],
                        profile_picture=user_info.get('picture', ''),
                        auth_provider='google',
                        password=make_password(secrets.token_urlsafe(32)),  # Random password
                    )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'profile_picture': user.profile_picture,
                    'auth_provider': user.auth_provider,
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
