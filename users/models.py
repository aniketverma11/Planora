from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid

class CustomUser(AbstractUser):
    DESIGNATION_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('team_lead', 'Team Lead'),
        ('developer', 'Developer'),
        ('user', 'User'),
    ]
    
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    microsoft_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    profile_picture = models.URLField(max_length=500, null=True, blank=True)
    auth_provider = models.CharField(max_length=50, default='local')  # 'local', 'google', or 'microsoft'
    designation = models.CharField(max_length=50, choices=DESIGNATION_CHOICES, default='user')
    
    # Email verification fields
    email_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=100, null=True, blank=True, unique=True)
    verification_token_created_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.username
    
    def is_admin(self):
        return self.designation == 'admin'
    
    def generate_verification_token(self):
        """Generate a unique verification token"""
        self.verification_token = str(uuid.uuid4())
        self.verification_token_created_at = timezone.now()
        self.save()
        return self.verification_token
    
    def is_verification_token_valid(self):
        """Check if verification token is still valid (24 hours)"""
        if not self.verification_token or not self.verification_token_created_at:
            return False
        expiry_time = self.verification_token_created_at + timedelta(hours=24)
        return timezone.now() < expiry_time




