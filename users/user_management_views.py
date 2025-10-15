from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from .models import CustomUser
from .serializers import UserSerializer, UserListSerializer


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users - only accessible to admin users
    """
    queryset = CustomUser.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        return UserSerializer
    
    def get_queryset(self):
        """Allow filtering and searching users"""
        queryset = CustomUser.objects.all().order_by('-date_joined')
        
        # Filter by designation
        designation = self.request.query_params.get('designation', None)
        if designation:
            queryset = queryset.filter(designation=designation)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Search by username or email
        search = self.request.query_params.get('search', None)
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
    
    @action(detail=False, methods=['get'])
    def available_permissions(self, request):
        """
        Get all available permissions for tasks, projects, and users
        """
        # Get content types for our models
        apps_to_include = ['tasks', 'project', 'users']
        
        permissions_data = []
        
        for app_label in apps_to_include:
            content_types = ContentType.objects.filter(app_label=app_label)
            
            for ct in content_types:
                permissions = Permission.objects.filter(content_type=ct)
                if permissions.exists():
                    permissions_data.append({
                        'app_label': app_label,
                        'model': ct.model,
                        'model_name': ct.model_class()._meta.verbose_name if ct.model_class() else ct.model,
                        'permissions': [
                            {
                                'id': p.id,
                                'name': p.name,
                                'codename': p.codename,
                                'content_type': p.content_type_id
                            }
                            for p in permissions
                        ]
                    })
        
        return Response(permissions_data)
    
    @action(detail=False, methods=['get'])
    def current_user(self, request):
        """
        Get current logged-in user with designation
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
