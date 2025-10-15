#!/usr/bin/env python
"""Generate task numbers for existing tasks"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'task_management.settings')
django.setup()

from tasks.models import Task
from project.models import Project

def generate_task_numbers():
    print("\n" + "="*60)
    print("Generating Task Numbers for Existing Tasks")
    print("="*60 + "\n")
    
    # Get all tasks without task_number
    tasks_without_number = Task.objects.filter(task_number__isnull=True)
    total_count = tasks_without_number.count()
    
    print(f"Found {total_count} tasks without task numbers\n")
    
    if total_count == 0:
        print("✅ All tasks already have task numbers!")
        return
    
    updated_count = 0
    
    # Group by project
    projects = Project.objects.all()
    
    for project in projects:
        project_tasks = tasks_without_number.filter(project=project).order_by('id')
        
        if project_tasks.exists():
            print(f"\n📁 Project: {project.name} ({project.key})")
            
            for task in project_tasks:
                # Save will auto-generate task_number
                task.save()
                print(f"   ✅ {task.task_number} - {task.title}")
                updated_count += 1
    
    # Handle tasks without project
    no_project_tasks = tasks_without_number.filter(project__isnull=True).order_by('id')
    
    if no_project_tasks.exists():
        print(f"\n📋 Tasks without project:")
        
        for task in no_project_tasks:
            task.save()
            print(f"   ✅ {task.task_number} - {task.title}")
            updated_count += 1
    
    print("\n" + "="*60)
    print(f"✅ Generated task numbers for {updated_count} tasks")
    print("="*60 + "\n")

if __name__ == '__main__':
    generate_task_numbers()
