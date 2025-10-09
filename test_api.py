#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'task_management.settings')
django.setup()

# Test API directly using Django test client
from django.test import Client
from django.urls import reverse

client = Client()

print("=== Testing all_tasks API endpoint ===")
response = client.get('/api/tasks/all_tasks/')
print(f"Status Code: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    print(f"Number of tasks returned: {len(data)}")
    print("\n=== Task Data Structure ===")
    for task in data:
        parent_id = task.get('parent_task')
        print(f"Task: {task['title']} (ID: {task['id']}, Parent: {parent_id})")
        if task.get('subtasks'):
            print(f"  Has {len(task['subtasks'])} subtasks in response")

    print("\n=== Hierarchical Structure ===")
    main_tasks = [t for t in data if not t.get('parent_task')]
    subtasks = [t for t in data if t.get('parent_task')]
    
    print(f"Main tasks: {len(main_tasks)}")
    print(f"Subtasks: {len(subtasks)}")
    
    for main_task in main_tasks:
        print(f"\n📋 {main_task['title']} (ID: {main_task['id']})")
        task_subtasks = [t for t in subtasks if t.get('parent_task') == main_task['id']]
        for subtask in task_subtasks:
            print(f"  └─ {subtask['title']} (ID: {subtask['id']})")
else:
    print(f"Error: {response.content.decode()}")