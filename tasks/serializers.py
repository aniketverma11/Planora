from rest_framework import serializers
from .models import Task, SubTask

class SubTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubTask
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    subtasks = SubTaskSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = '__all__'

class TaskCreateUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False)
    status = serializers.CharField(required=False)
    priority = serializers.CharField(required=False)
    due_date = serializers.DateField(required=False)
    assignee_id = serializers.IntegerField(required=False)

    def create(self, validated_data):
        return Task.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.status = validated_data.get('status', instance.status)
        instance.priority = validated_data.get('priority', instance.priority)
        instance.due_date = validated_data.get('due_date', instance.due_date)
        instance.assignee_id = validated_data.get('assignee_id', instance.assignee_id)
        instance.save()
        return instance

class SubTaskCreateUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False)
    status = serializers.CharField(required=False)
    due_date = serializers.DateField(required=False)
    task_id = serializers.IntegerField()

    def create(self, validated_data):
        return SubTask.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.status = validated_data.get('status', instance.status)
        instance.due_date = validated_data.get('due_date', instance.due_date)
        instance.task_id = validated_data.get('task_id', instance.task_id)
        instance.save()
        return instance
