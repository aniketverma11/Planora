#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'task_management.settings')
django.setup()

from tasks.models import Task
from datetime import datetime, timedelta

print("=== Creating Additional Test Tasks ===")

# Create another parent task
parent2 = Task.objects.create(
    title='Feature Development',
    description='Develop new features',
    status='To Do',
    priority='Medium',
    start_date=datetime.now().date() + timedelta(days=15),
    due_date=datetime.now().date() + timedelta(days=30),
    duration=15,
    progress=0
)

# Create subtasks for second parent
subtask3 = Task.objects.create(
    title='UI Design',
    description='Design user interface',
    status='In Progress',
    priority='High',
    parent_task=parent2,
    start_date=datetime.now().date() + timedelta(days=15),
    due_date=datetime.now().date() + timedelta(days=20),
    duration=5,
    progress=25
)

subtask4 = Task.objects.create(
    title='Backend API',
    description='Develop backend API',
    status='To Do',
    priority='High',
    parent_task=parent2,
    start_date=datetime.now().date() + timedelta(days=20),
    due_date=datetime.now().date() + timedelta(days=28),
    duration=8,
    progress=0
)

# Create standalone task
standalone = Task.objects.create(
    title='Documentation Update',
    description='Update project documentation',
    status='Done',
    priority='Low',
    start_date=datetime.now().date() - timedelta(days=5),
    due_date=datetime.now().date() - timedelta(days=1),
    duration=4,
    progress=100
)

print(f'Created parent task 2: {parent2.title} (ID: {parent2.id})')
print(f'Created subtask 3: {subtask3.title} (ID: {subtask3.id}, Parent: {subtask3.parent_task_id})')
print(f'Created subtask 4: {subtask4.title} (ID: {subtask4.id}, Parent: {subtask4.parent_task_id})')
print(f'Created standalone task: {standalone.title} (ID: {standalone.id})')

# Show final hierarchy
print("\n=== Final Task Hierarchy ===")
all_tasks = Task.objects.all()
main_tasks = [t for t in all_tasks if t.parent_task is None]
subtasks = [t for t in all_tasks if t.parent_task is not None]

print(f"Total tasks: {all_tasks.count()}")
print(f"Main tasks: {len(main_tasks)}")
print(f"Subtasks: {len(subtasks)}")

for main_task in main_tasks:
    print(f"\n📋 {main_task.title} (ID: {main_task.id}) - {main_task.progress}%")
    task_subtasks = [t for t in subtasks if t.parent_task_id == main_task.id]
    for subtask in task_subtasks:
        print(f"  └─ {subtask.title} (ID: {subtask.id}) - {subtask.progress}%")