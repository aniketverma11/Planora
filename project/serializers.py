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
            
            # Send email to all initial members
            try:
                from utils.email_service import email_service
                from utils.email_templates.templates import project_team_addition_email_template
                
                # Get request user from context
                request = self.context.get('request')
                added_by = request.user if request else project.owner
                
                for user in members:
                    # Only send email if user has verified email
                    if user.email and user.email_verified:
                        try:
                            html_content = project_team_addition_email_template(
                                user=user,
                                project=project,
                                added_by=added_by
                            )
                            
                            result = email_service.send_email(
                                to_email=user.email,
                                subject=f'Added to Project: {project.name}',
                                html_content=html_content
                            )
                            
                            if result:
                                print(f"✅ Project team addition email sent to {user.email}")
                            else:
                                print(f"❌ Email service returned False for {user.email}")
                        except Exception as e:
                            print(f"❌ Failed to send email to {user.email}: {str(e)}")
                    else:
                        if not user.email:
                            print(f"⚠️ User {user.username} has no email address")
                        elif not user.email_verified:
                            print(f"⚠️ User {user.username} email not verified: {user.email}")
                            
            except Exception as e:
                print(f"❌ Error processing member addition emails: {str(e)}")
                import traceback
                traceback.print_exc()
        
        return project

    def update(self, instance, validated_data):
        members = validated_data.pop('members', None)
        
        # Get old members before update
        old_member_ids = set(instance.members.values_list('id', flat=True)) if members is not None else set()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if members is not None:
            instance.members.set(members)
            
            # Get new member IDs
            new_member_ids = set(m.id for m in members)
            
            # Find newly added members
            added_member_ids = new_member_ids - old_member_ids
            
            # Send email to newly added members
            if added_member_ids:
                try:
                    from utils.email_service import email_service
                    from utils.email_templates.templates import project_team_addition_email_template
                    
                    # Get request user from context
                    request = self.context.get('request')
                    added_by = request.user if request else instance.owner
                    
                    for member_id in added_member_ids:
                        user = CustomUser.objects.get(id=member_id)
                        
                        # Only send email if user has verified email
                        if user.email and user.email_verified:
                            try:
                                html_content = project_team_addition_email_template(
                                    user=user,
                                    project=instance,
                                    added_by=added_by
                                )
                                
                                result = email_service.send_email(
                                    to_email=user.email,
                                    subject=f'Added to Project: {instance.name}',
                                    html_content=html_content
                                )
                                
                                if result:
                                    print(f"✅ Project team addition email sent to {user.email}")
                                else:
                                    print(f"❌ Email service returned False for {user.email}")
                            except Exception as e:
                                print(f"❌ Failed to send email to {user.email}: {str(e)}")
                        else:
                            if not user.email:
                                print(f"⚠️ User {user.username} has no email address")
                            elif not user.email_verified:
                                print(f"⚠️ User {user.username} email not verified: {user.email}")
                                
                except Exception as e:
                    print(f"❌ Error processing member addition emails: {str(e)}")
                    import traceback
                    traceback.print_exc()
        
        return instance
