from rest_framework import serializers
from .models import Project
from users.models import CustomUser

class ProjectMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ProjectListSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    member_count = serializers.SerializerMethodField()
    task_count = serializers.IntegerField(read_only=True)
    completed_task_count = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'key', 'description', 'status',
            'start_date', 'end_date', 'owner', 'owner_username',
            'member_count', 'task_count', 'completed_task_count',
            'progress_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_member_count(self, obj):
        return obj.members.count()

class ProjectDetailSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    members = ProjectMemberSerializer(many=True, read_only=True)
    member_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=CustomUser.objects.all(),
        write_only=True,
        required=False,
        source='members'
    )
    task_count = serializers.IntegerField(read_only=True)
    completed_task_count = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'key', 'description', 'status',
            'start_date', 'end_date', 'owner', 'owner_username', 'owner_email',
            'members', 'member_ids', 'task_count', 'completed_task_count',
            'progress_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        members = validated_data.pop('members', [])
        project = Project.objects.create(**validated_data)
        if members:
            project.members.set(members)
        return project

    def update(self, instance, validated_data):
        members = validated_data.pop('members', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if members is not None:
            instance.members.set(members)
        return instance
