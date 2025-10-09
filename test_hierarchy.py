#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'task_management.settings')
django.setup()

from tasks.models import Task
from datetime import datetime, timedelta

# Clear existing tasks for clean test
Task.objects.all().delete()

# Create parent task
parent = Task.objects.create(
    title='Project Setup',
    description='Main project setup task',
    status='In Progress',
    priority='High',
    start_date=datetime.now().date(),
    due_date=datetime.now().date() + timedelta(days=10),
    duration=10,
    progress=30
)

# Create subtasks
subtask1 = Task.objects.create(
    title='Environment Setup',
    description='Setup development environment',
    status='Done',
    priority='High',
    parent_task=parent,
    start_date=datetime.now().date(),
    due_date=datetime.now().date() + timedelta(days=2),
    duration=2,
    progress=100
)

subtask2 = Task.objects.create(
    title='Database Configuration',
    description='Configure database settings',
    status='In Progress',
    priority='Medium',
    parent_task=parent,
    start_date=datetime.now().date() + timedelta(days=3),
    due_date=datetime.now().date() + timedelta(days=6),
    duration=3,
    progress=50
)

print(f'Created parent task: {parent.title} (ID: {parent.id})')
print(f'Created subtask 1: {subtask1.title} (ID: {subtask1.id}, Parent: {subtask1.parent_task_id})')
print(f'Created subtask 2: {subtask2.title} (ID: {subtask2.id}, Parent: {subtask2.parent_task_id})')

# Test the API serialization
from tasks.serializers import TaskSerializer
from tasks.views import TaskViewSet

print("\n=== Testing API Response ===")
all_tasks = Task.objects.all()
serializer = TaskSerializer(all_tasks, many=True)
data = serializer.data

for task in data:
    print(f"Task: {task['title']} (ID: {task['id']}, Parent: {task.get('parent_task', 'None')})")
    if task.get('subtasks'):
        for subtask in task['subtasks']:
            print(f"  └─ Subtask: {subtask['title']} (ID: {subtask['id']}, Parent: {subtask.get('parent_task', 'None')})")