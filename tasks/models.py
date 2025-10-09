from django.db import models
from users.models import CustomUser
from datetime import datetime, timedelta

class Task(models.Model):
    STATUS_CHOICES = (
        ('To Do', 'To Do'),
        ('In Progress', 'In Progress'),
        ('Done', 'Done'),
    )
    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='To Do')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    start_date = models.DateField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    duration = models.IntegerField(default=1, help_text="Duration in days")
    progress = models.IntegerField(default=0, help_text="Progress percentage (0-100)")
    parent_task = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='subtasks')
    assignee = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, blank=True, null=True, related_name='tasks')
    dependencies = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='dependents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Check if we should skip progress auto-calculation
        skip_progress_auto = kwargs.pop('skip_progress_auto', False)
        
        # Auto-set start_date if not provided
        if not self.start_date and self.due_date:
            self.start_date = self.due_date - timedelta(days=self.duration - 1)
        elif not self.due_date and self.start_date:
            self.due_date = self.start_date + timedelta(days=self.duration - 1)
        elif not self.start_date and not self.due_date:
            self.start_date = datetime.now().date()
            self.due_date = self.start_date + timedelta(days=self.duration - 1)
        
        # Auto-calculate progress based on status only if not explicitly skipped
        if not skip_progress_auto:
            if self.status == 'Done' and self.progress < 100:
                self.progress = 100
            elif self.status == 'In Progress' and self.progress == 0:
                self.progress = 50
            # Only set progress to 0 for new 'To Do' tasks, not when updating
            elif self.status == 'To Do' and not self.pk:  # Only for new instances
                self.progress = 0
            
        super().save(*args, **kwargs)

    @property
    def is_subtask(self):
        return self.parent_task is not None

    def __str__(self):
        return self.title


