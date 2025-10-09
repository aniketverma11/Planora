from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task
from .serializers import (
    TaskSerializer,
    TaskCreateUpdateSerializer,
)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TaskCreateUpdateSerializer
        return TaskSerializer

    def get_queryset(self):
        # Return main tasks (not subtasks) by default
        queryset = Task.objects.filter(parent_task__isnull=True)
        return queryset
    
    @action(detail=True, methods=['get'])
    def subtasks(self, request, pk=None):
        """Get all subtasks for a specific task"""
        task = self.get_object()
        subtasks = task.subtasks.all()
        serializer = TaskSerializer(subtasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def all_tasks(self, request):
        """Get all tasks including subtasks for Gantt chart"""
        all_tasks = Task.objects.all()
        serializer = TaskSerializer(all_tasks, many=True)
        return Response(serializer.data)
