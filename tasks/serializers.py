from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    subtasks = serializers.SerializerMethodField()
    dependencies = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    parent_task = serializers.PrimaryKeyRelatedField(read_only=True)
    assignee_username = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = '__all__'
    
    def get_subtasks(self, obj):
        if obj.subtasks.exists():
            return TaskSerializer(obj.subtasks.all(), many=True).data
        return []
    
    def get_assignee_username(self, obj):
        if obj.assignee:
            return obj.assignee.username
        return None

class TaskCreateUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False)
    status = serializers.CharField(required=False)
    priority = serializers.CharField(required=False)
    start_date = serializers.DateField(required=False)
    due_date = serializers.DateField(required=False)
    duration = serializers.IntegerField(required=False)
    progress = serializers.IntegerField(required=False)
    parent_task_id = serializers.IntegerField(required=False, allow_null=True)
    assignee_id = serializers.IntegerField(required=False, allow_null=True)
    dependencies = serializers.PrimaryKeyRelatedField(many=True, queryset=Task.objects.all(), required=False)

    def create(self, validated_data):
        dependencies = validated_data.pop('dependencies', [])
        parent_task_id = validated_data.pop('parent_task_id', None)
        
        # Check if progress was explicitly provided
        has_explicit_progress = 'progress' in validated_data
        
        if parent_task_id:
            try:
                parent_task = Task.objects.get(id=parent_task_id)
                validated_data['parent_task'] = parent_task
            except Task.DoesNotExist:
                pass  # If parent task doesn't exist, create as main task
        
        # Create the task with explicit progress preservation
        task = Task(**validated_data)
        task.save(skip_progress_auto=has_explicit_progress)
        task.dependencies.set(dependencies)
        return task

    def update(self, instance, validated_data):
        dependencies = validated_data.pop('dependencies', None)
        parent_task_id = validated_data.pop('parent_task_id', None)
        
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.status = validated_data.get('status', instance.status)
        instance.priority = validated_data.get('priority', instance.priority)
        instance.start_date = validated_data.get('start_date', instance.start_date)
        instance.due_date = validated_data.get('due_date', instance.due_date)
        instance.duration = validated_data.get('duration', instance.duration)
        instance.progress = validated_data.get('progress', instance.progress)
        instance.assignee_id = validated_data.get('assignee_id', instance.assignee_id)
        
        if parent_task_id is not None:
            if parent_task_id == '' or parent_task_id == 0:
                instance.parent_task = None
            else:
                try:
                    parent_task = Task.objects.get(id=parent_task_id)
                    instance.parent_task = parent_task
                except Task.DoesNotExist:
                    pass  # Keep existing parent if new one doesn't exist
            
        # If progress was explicitly provided, skip auto-calculation
        skip_progress_auto = 'progress' in validated_data
        instance.save(skip_progress_auto=skip_progress_auto)
        if dependencies is not None:
            instance.dependencies.set(dependencies)
        return instance
