from rest_framework import viewsets
from .models import Task, SubTask
from .serializers import (
    TaskSerializer,
    TaskCreateUpdateSerializer,
    SubTaskSerializer,
    SubTaskCreateUpdateSerializer,
)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TaskCreateUpdateSerializer
        return TaskSerializer

class SubTaskViewSet(viewsets.ModelViewSet):
    queryset = SubTask.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SubTaskCreateUpdateSerializer
        return SubTaskSerializer
