from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import Task, TaskDocument

class TaskAdmin(ImportExportModelAdmin):
    list_display = ('title', 'status', 'priority', 'start_date', 'due_date', 'assignee', 'parent_task', 'progress')
    list_filter = ('status', 'priority', 'assignee', 'parent_task')
    search_fields = ('title', 'description')
    raw_id_fields = ('parent_task', 'assignee')
    filter_horizontal = ('dependencies',)

class TaskDocumentAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'task', 'file_type', 'get_formatted_size', 'uploaded_by', 'uploaded_at')
    list_filter = ('file_type', 'uploaded_at')
    search_fields = ('file_name', 'task__title')
    raw_id_fields = ('task', 'uploaded_by')
    readonly_fields = ('uploaded_at', 'file_size')

admin.site.register(Task, TaskAdmin)
admin.site.register(TaskDocument, TaskDocumentAdmin)
