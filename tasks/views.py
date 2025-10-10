from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Task, TaskDocument
from .serializers import (
    TaskSerializer,
    TaskCreateUpdateSerializer,
    TaskDocumentSerializer,
)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TaskCreateUpdateSerializer
        return TaskSerializer

    def get_queryset(self):
        queryset = Task.objects.all()
        
        # Filter by project if project_id is provided
        project_id = self.request.query_params.get('project_id', None)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Filter to show only main tasks (not subtasks) unless showing all
        if self.action not in ['all_tasks']:
            queryset = queryset.filter(parent_task__isnull=True)
        
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
        # Get base queryset (without parent_task filter)
        queryset = Task.objects.all()
        
        # Filter by project if project_id is provided
        project_id = self.request.query_params.get('project_id', None)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        serializer = TaskSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def upload_document(self, request, pk=None):
        """Upload a document for a task"""
        task = self.get_object()
        file = request.FILES.get('file')
        
        if not file:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create document
        document = TaskDocument(
            task=task,
            file=file,
            file_name=file.name,
            file_size=file.size,
            file_type=file.content_type,
            uploaded_by=request.user
        )
        document.save()
        
        serializer = TaskDocumentSerializer(document)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], url_path='delete_document/(?P<document_id>[^/.]+)')
    def delete_document(self, request, pk=None, document_id=None):
        """Delete a document from a task"""
        task = self.get_object()
        
        try:
            document = TaskDocument.objects.get(id=document_id, task=task)
            document.file.delete()  # Delete the actual file
            document.delete()  # Delete the database record
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TaskDocument.DoesNotExist:
            return Response(
                {'error': 'Document not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get all documents for a task"""
        task = self.get_object()
        documents = task.documents.all()
        serializer = TaskDocumentSerializer(documents, many=True)
        return Response(serializer.data)
