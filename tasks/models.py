from django.db import models
from users.models import CustomUser
from datetime import datetime, timedelta
import os

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
    task_number = models.CharField(max_length=50, unique=True, blank=True, null=True, help_text="Unique task ID like PROJ-0001")
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='To Do', null=True, blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    start_date = models.DateField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    duration = models.IntegerField(default=1, help_text="Duration in days")
    progress = models.IntegerField(default=0, help_text="Progress percentage (0-100)")
    project = models.ForeignKey('project.Project', on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    parent_task = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='subtasks')
    assignee = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, blank=True, null=True, related_name='tasks')
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, blank=True, null=True, related_name='created_tasks')
    dependencies = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='dependents')
    
    # Critical Path Method (CPM) fields
    early_start_day = models.IntegerField(default=0, help_text="Early start day from project start")
    early_finish_day = models.IntegerField(default=0, help_text="Early finish day from project start")
    late_start_day = models.IntegerField(default=0, help_text="Late start day from project start")
    late_finish_day = models.IntegerField(default=0, help_text="Late finish day from project start")
    total_float = models.IntegerField(default=0, help_text="Total float/slack in days")
    is_critical = models.BooleanField(default=False, help_text="Is this task on the critical path")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Generate task_number if not exists
        if not self.task_number and self.project:
            # Get project key
            project_key = self.project.key if self.project.key else 'TASK'
            
            # Get the highest task number for this project
            last_task = Task.objects.filter(
                project=self.project,
                task_number__startswith=f"{project_key}-"
            ).order_by('-task_number').first()
            
            if last_task and last_task.task_number:
                # Extract number from last task (e.g., "PROJ-0005" -> 5)
                try:
                    last_number = int(last_task.task_number.split('-')[-1])
                    next_number = last_number + 1
                except (ValueError, IndexError):
                    next_number = 1
            else:
                next_number = 1
            
            # Generate task number with zero-padding (min 4 digits)
            self.task_number = f"{project_key}-{next_number:04d}"
        elif not self.task_number and not self.project:
            # For tasks without project, use TASK prefix
            last_task = Task.objects.filter(
                project__isnull=True,
                task_number__startswith="TASK-"
            ).order_by('-task_number').first()
            
            if last_task and last_task.task_number:
                try:
                    last_number = int(last_task.task_number.split('-')[-1])
                    next_number = last_number + 1
                except (ValueError, IndexError):
                    next_number = 1
            else:
                next_number = 1
            
            self.task_number = f"TASK-{next_number:04d}"
        
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

    class Meta:
        indexes = [
            models.Index(fields=['is_critical', 'project']),
            models.Index(fields=['total_float', 'project']),
            models.Index(fields=['early_start_day', 'early_finish_day']),
        ]
        ordering = ['id']

    def __str__(self):
        if self.task_number:
            return f"{self.task_number} - {self.title}"
        return self.title


class TaskDocument(models.Model):
    """Model to store multiple documents/attachments for a task"""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='task_documents/%Y/%m/%d/')
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField(help_text="File size in bytes")
    file_type = models.CharField(max_length=100)  # MIME type
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def save(self, *args, **kwargs):
        if self.file:
            # Extract file name if not set
            if not self.file_name:
                self.file_name = os.path.basename(self.file.name)
            
            # Get file size
            if not self.file_size and hasattr(self.file, 'size'):
                self.file_size = self.file.size
                
        super().save(*args, **kwargs)
    
    def get_file_extension(self):
        """Get file extension"""
        return os.path.splitext(self.file_name)[1].lower()
    
    def is_image(self):
        """Check if file is an image"""
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp']
        return self.get_file_extension() in image_extensions
    
    def is_pdf(self):
        """Check if file is a PDF"""
        return self.get_file_extension() == '.pdf'
    
    def get_formatted_size(self):
        """Get human-readable file size"""
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    
    def __str__(self):
        return f"{self.file_name} - {self.task.title}"
