#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'task_management.settings')
django.setup()

from tasks.models import Task

print("=== Current Task Hierarchy Status ===")

all_tasks = Task.objects.all()
main_tasks = [t for t in all_tasks if t.parent_task is None]
subtasks = [t for t in all_tasks if t.parent_task is not None]

print(f"Total tasks: {all_tasks.count()}")
print(f"Main tasks: {len(main_tasks)}")
print(f"Subtasks: {len(subtasks)}")

print("\n=== Task Details for Gantt Chart ===")
for main_task in main_tasks:
    print(f"\n📋 {main_task.title}")
    print(f"   ID: {main_task.id}")
    print(f"   Progress: {main_task.progress}%")
    print(f"   Status: {main_task.status}")
    print(f"   Start: {main_task.start_date}")
    print(f"   Duration: {main_task.duration} days")
    
    task_subtasks = [t for t in subtasks if t.parent_task_id == main_task.id]
    print(f"   Subtasks: {len(task_subtasks)}")
    
    for subtask in task_subtasks:
        print(f"     └─ {subtask.title}")
        print(f"        ID: {subtask.id}, Progress: {subtask.progress}%")
        print(f"        Status: {subtask.status}, Duration: {subtask.duration} days")

print("\n=== API Format Check ===")
from tasks.serializers import TaskSerializer

all_tasks_data = TaskSerializer(all_tasks, many=True).data
print(f"API returns {len(all_tasks_data)} tasks")

for task in all_tasks_data:
    parent_id = task.get('parent_task')
    if parent_id:
        print(f"Subtask: {task['title']} -> Parent ID: {parent_id}")
    else:
        subtask_count = len([t for t in all_tasks_data if t.get('parent_task') == task['id']])
        if subtask_count > 0:
            print(f"Parent: {task['title']} -> Has {subtask_count} subtasks")