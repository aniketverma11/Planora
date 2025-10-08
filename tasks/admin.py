from django.contrib import admin
from .models import Task, SubTask

class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'priority', 'due_date', 'assignee')
    list_filter = ('status', 'priority', 'assignee')
    search_fields = ('title', 'description')

class SubTaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'task', 'status', 'due_date')
    list_filter = ('status',)
    search_fields = ('title', 'description')

admin.site.register(Task, TaskAdmin)
admin.site.register(SubTask, SubTaskAdmin)
