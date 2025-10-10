from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Project
from .serializers import ProjectListSerializer, ProjectDetailSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Return projects where user is owner or member
        """
        user = self.request.user
        return Project.objects.filter(
            Q(owner=user) | Q(members=user)
        ).distinct().prefetch_related('members', 'owner')
    
    def get_serializer_class(self):
        if self.action in ['list', 'my_projects']:
            return ProjectListSerializer
        return ProjectDetailSerializer
    
    def perform_create(self, serializer):
        """Set the current user as owner if not specified"""
        if 'owner' not in serializer.validated_data or serializer.validated_data['owner'] is None:
            serializer.save(owner=self.request.user)
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def my_projects(self, request):
        """Get all projects for the current user"""
        projects = self.get_queryset().order_by('-updated_at')
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to the project"""
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from users.models import CustomUser
            user = CustomUser.objects.get(id=user_id)
            project.members.add(user)
            return Response({'message': f'User {user.username} added successfully'})
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """Remove a member from the project"""
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from users.models import CustomUser
            user = CustomUser.objects.get(id=user_id)
            project.members.remove(user)
            return Response({'message': f'User {user.username} removed successfully'})
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get detailed statistics for a project"""
        project = self.get_object()
        
        tasks = project.tasks.all()
        total_tasks = tasks.count()
        
        stats_data = {
            'total_tasks': total_tasks,
            'completed_tasks': tasks.filter(status='Done').count(),
            'in_progress_tasks': tasks.filter(status='In Progress').count(),
            'todo_tasks': tasks.filter(status='To Do').count(),
            'high_priority_tasks': tasks.filter(priority='High').count(),
            'medium_priority_tasks': tasks.filter(priority='Medium').count(),
            'low_priority_tasks': tasks.filter(priority='Low').count(),
            'progress_percentage': project.progress_percentage,
            'member_count': project.members.count(),
        }
        
        return Response(stats_data)
