from django.contrib.auth.models import AbstractUser
from django.db import models

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
    
    def __str__(self):
        return self.username
    
    def is_admin(self):
        return self.designation == 'admin'


