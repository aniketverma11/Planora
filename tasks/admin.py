from django.contrib import admin
from .models import Task

class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'priority', 'start_date', 'due_date', 'assignee', 'parent_task', 'progress')
    list_filter = ('status', 'priority', 'assignee', 'parent_task')
    search_fields = ('title', 'description')
    raw_id_fields = ('parent_task', 'assignee')
    filter_horizontal = ('dependencies',)

admin.site.register(Task, TaskAdmin)
