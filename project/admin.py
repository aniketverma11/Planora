from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('key', 'name', 'status', 'owner', 'task_count', 'progress_percentage', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'key', 'description')
    filter_horizontal = ('members',)
    readonly_fields = ('created_at', 'updated_at', 'task_count', 'completed_task_count', 'progress_percentage')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'key', 'description', 'status')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date')
        }),
        ('Team', {
            'fields': ('owner', 'members')
        }),
        ('Statistics', {
            'fields': ('task_count', 'completed_task_count', 'progress_percentage')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
