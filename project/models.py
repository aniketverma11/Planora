from django.db import models
from users.models import CustomUser
from datetime import datetime

class Project(models.Model):
    STATUS_CHOICES = (
        ('Planning', 'Planning'),
        ('Active', 'Active'),
        ('On Hold', 'On Hold'),
        ('Completed', 'Completed'),
        ('Archived', 'Archived'),
    )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    key = models.CharField(max_length=10, unique=True, help_text="Project key (e.g., PROJ, TASK)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    owner = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='owned_projects')
    members = models.ManyToManyField(CustomUser, related_name='projects', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'

    def __str__(self):
        return f"{self.key} - {self.name}"

    @property
    def task_count(self):
        return self.tasks.count()

    @property
    def completed_task_count(self):
        return self.tasks.filter(status='Done').count()

    @property
    def progress_percentage(self):
        total = self.task_count
        if total == 0:
            return 0
        completed = self.completed_task_count
        return round((completed / total) * 100, 2)
