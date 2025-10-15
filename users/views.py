from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .serializers import UserSerializer, UserListSerializer, AvailablePermissionsSerializer, CustomTokenObtainPairSerializer
from .models import CustomUser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import permissions
from .google_auth import verify_google_token
from .microsoft_auth import verify_microsoft_token
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
import secrets


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access user management
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.designation == 'admin'

class SignUpView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

class LoginView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = CustomTokenObtainPairSerializer

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
                    'designation': user.designation,
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class MicrosoftAuthView(APIView):
    """
    Handle Microsoft OAuth authentication
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

            # Verify the Microsoft token and get user info
            user_info = verify_microsoft_token(token)

            # Check if user exists with this Microsoft ID
            user = CustomUser.objects.filter(microsoft_id=user_info['microsoft_id']).first()

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
                    # Link Microsoft account to existing user
                    user.microsoft_id = user_info['microsoft_id']
                    user.auth_provider = 'microsoft'
                    user.profile_picture = user_info.get('profile_picture', '')
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
                        first_name=user_info.get('given_name', ''),
                        last_name=user_info.get('family_name', ''),
                        microsoft_id=user_info['microsoft_id'],
                        profile_picture=user_info.get('profile_picture', ''),
                        auth_provider='microsoft',
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
                    'designation': user.designation,
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )



class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users - only accessible to admin users
    """
    queryset = CustomUser.objects.all()
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == "list":
            return UserListSerializer
        return UserSerializer
    
    def get_queryset(self):
        """Allow filtering and searching users"""
        queryset = CustomUser.objects.all().order_by("-date_joined")
        
        # Filter by designation
        designation = self.request.query_params.get("designation", None)
        if designation:
            queryset = queryset.filter(designation=designation)
        
        # Filter by active status
        is_active = self.request.query_params.get("is_active", None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
        
        # Search by username or email
        search = self.request.query_params.get("search", None)
        if search:
            queryset = queryset.filter(
                username__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                first_name__icontains=search
            ) | queryset.filter(
                last_name__icontains=search
            )
        
        return queryset
    
    @action(detail=False, methods=["get"])
    def available_permissions(self, request):
        """
        Get all available permissions for tasks, projects, and users
        """
        # Get content types for our models
        apps_to_include = ["tasks", "project", "users"]
        
        permissions_data = []
        
        for app_label in apps_to_include:
            content_types = ContentType.objects.filter(app_label=app_label)
            
            for ct in content_types:
                permissions = Permission.objects.filter(content_type=ct)
                if permissions.exists():
                    permissions_data.append({
                        "app_label": app_label,
                        "model": ct.model,
                        "model_name": ct.model_class()._meta.verbose_name if ct.model_class() else ct.model,
                        "permissions": [
                            {
                                "id": p.id,
                                "name": p.name,
                                "codename": p.codename,
                                "content_type": p.content_type_id
                            }
                            for p in permissions
                        ]
                    })
        
        return Response(permissions_data)
    
    @action(detail=False, methods=["get"])
    def current_user(self, request):
        """
        Get current logged-in user with designation
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class CurrentUserView(APIView):
    """
    Get current user information
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
