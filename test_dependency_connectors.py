#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'task_management.settings')
django.setup()

from tasks.models import Task
from tasks.serializers import TaskSerializer

print("=== Testing Dependency Connectors ===\n")

# Get all tasks with dependencies
all_tasks = Task.objects.all()
tasks_with_deps = [t for t in all_tasks if t.dependencies.exists()]

print(f"Total tasks: {all_tasks.count()}")
print(f"Tasks with dependencies: {len(tasks_with_deps)}\n")

for task in tasks_with_deps:
    deps = task.dependencies.all()
    print(f"📋 {task.title} (ID: {task.id})")
    print(f"   Progress: {task.progress}%")
    print(f"   Position: Row {list(all_tasks).index(task)}")
    print(f"   Dependencies ({len(deps)}):")
    
    for dep in deps:
        dep_row = list(all_tasks).index(dep)
        print(f"     → {dep.title} (ID: {dep.id})")
        print(f"       Progress: {dep.progress}%")
        print(f"       Position: Row {dep_row}")
        print(f"       Visual: Connector should go from row {dep_row} to row {list(all_tasks).index(task)}")
    print()

# Test API response
print("=== API Response Test ===")
serializer = TaskSerializer(all_tasks, many=True)
data = serializer.data

print(f"API returns {len(data)} tasks")
for task in data:
    if task.get('dependencies') and len(task['dependencies']) > 0:
        print(f"\n{task['title']} (ID: {task['id']}) has dependencies:")
        for dep_id in task['dependencies']:
            dep_task = next((t for t in data if t['id'] == dep_id), None)
            if dep_task:
                print(f"  → Depends on: {dep_task['title']} (ID: {dep_id})")
                print(f"    Connector: Should draw from end of '{dep_task['title']}' to start of '{task['title']}'")

print("\n=== Expected Visual Result ===")
print("""
Timeline View:
┌──────────────────────────────────────┐
│ Environment Setup [███100%]          │
│                                      │ ↓
│                     ↓                │ │
│                     ↓                │ │
│ Database Config    [█████50%] ←──────┘
│                                      │
│ Project Setup [██30%█2]              │
│                                      │ ↓
│                     ↓                │ │
│                     ↓                │ │
│ UI Design    [███25%] ←──────────────┘
└──────────────────────────────────────┘

Connectors should:
✓ Start from END (right side) of predecessor task
✓ Go RIGHT horizontally (small gap)
✓ Go DOWN/UP vertically to target row
✓ Go RIGHT to start of dependent task
✓ End with ARROW pointing at dependent task
""")