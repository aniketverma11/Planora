#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, timedelta

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'task_management.settings')

# Setup Django
django.setup()

from tasks.models import Task
from users.models import CustomUser

def create_sample_data():
    # Clear existing tasks
    Task.objects.all().delete()
    
    # Get or create a user
    user, created = CustomUser.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@example.com'}
    )
    if created:
        user.set_password('admin123')
        user.save()
    
    # Create main tasks
    task1 = Task.objects.create(
        title="Project Planning",
        description="Plan the overall project structure and timeline",
        status="Done",
        start_date=datetime.now().date(),
        duration=5,
        progress=100,
        assignee=user
    )
    
    task2 = Task.objects.create(
        title="Development Phase",
        description="Main development work",
        status="In Progress",
        start_date=datetime.now().date() + timedelta(days=5),
        duration=15,
        progress=60,
        assignee=user
    )
    
    task3 = Task.objects.create(
        title="Testing Phase",
        description="Testing and quality assurance",
        status="To Do",
        start_date=datetime.now().date() + timedelta(days=20),
        duration=7,
        progress=0,
        assignee=user
    )
    
    # Create subtasks for Development Phase
    subtask1 = Task.objects.create(
        title="Frontend Development",
        description="Develop the user interface",
        status="Done",
        start_date=datetime.now().date() + timedelta(days=5),
        duration=8,
        progress=100,
        parent_task=task2,
        assignee=user
    )
    
    subtask2 = Task.objects.create(
        title="Backend Development",
        description="Develop server-side logic",
        status="In Progress",
        start_date=datetime.now().date() + timedelta(days=8),
        duration=10,
        progress=40,
        parent_task=task2,
        assignee=user
    )
    
    subtask3 = Task.objects.create(
        title="Database Setup",
        description="Configure and setup database",
        status="Done",
        start_date=datetime.now().date() + timedelta(days=5),
        duration=3,
        progress=100,
        parent_task=task2,
        assignee=user
    )
    
    # Create subtasks for Testing Phase
    test_subtask1 = Task.objects.create(
        title="Unit Testing",
        description="Write and run unit tests",
        status="To Do",
        start_date=datetime.now().date() + timedelta(days=20),
        duration=3,
        progress=0,
        parent_task=task3,
        assignee=user
    )
    
    test_subtask2 = Task.objects.create(
        title="Integration Testing",
        description="Test system integration",
        status="To Do",
        start_date=datetime.now().date() + timedelta(days=23),
        duration=4,
        progress=0,
        parent_task=task3,
        assignee=user
    )
    
    # Add dependencies
    task2.dependencies.add(task1)  # Development depends on Planning
    task3.dependencies.add(task2)  # Testing depends on Development
    subtask2.dependencies.add(subtask3)  # Backend depends on Database
    test_subtask2.dependencies.add(test_subtask1)  # Integration testing depends on Unit testing
    
    print("Sample data created successfully!")
    print(f"Created {Task.objects.count()} tasks total")
    print(f"Main tasks: {Task.objects.filter(parent_task__isnull=True).count()}")
    print(f"Subtasks: {Task.objects.filter(parent_task__isnull=False).count()}")

if __name__ == "__main__":
    create_sample_data()