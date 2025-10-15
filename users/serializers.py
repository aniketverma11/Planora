from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from .models import CustomUser


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add custom user data
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'designation': self.user.designation,
            'profile_picture': self.user.profile_picture,
            'auth_provider': self.user.auth_provider,
        }
        return data

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ('id', 'name', 'codename', 'content_type')

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    permissions = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Permission.objects.all(), 
        required=False,
        source='user_permissions'
    )
    permission_details = PermissionSerializer(source='user_permissions', many=True, read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 
                  'designation', 'profile_picture', 'is_active', 'permissions', 
                  'permission_details', 'auth_provider')
        extra_kwargs = {
            'password': {'write_only': True},
            'auth_provider': {'read_only': True}
        }

    def create(self, validated_data):
        permissions = validated_data.pop('user_permissions', [])
        password = validated_data.pop('password', None)
        
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        
        if permissions:
            user.user_permissions.set(permissions)
        
        return user

    def update(self, instance, validated_data):
        permissions = validated_data.pop('user_permissions', None)
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        
        if permissions is not None:
            instance.user_permissions.set(permissions)
        
        return instance


class UserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing users"""
    permission_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                  'designation', 'is_active', 'permission_count')
    
    def get_permission_count(self, obj):
        return obj.user_permissions.count()


class AvailablePermissionsSerializer(serializers.Serializer):
    """Serializer to return available permissions grouped by app"""
    app_label = serializers.CharField()
    model = serializers.CharField()
    permissions = PermissionSerializer(many=True)
