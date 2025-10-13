from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    profile_picture = models.URLField(max_length=500, null=True, blank=True)
    auth_provider = models.CharField(max_length=50, default='local')  # 'local' or 'google'
    
    def __str__(self):
        return self.username


