import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'task_management.settings')
django.setup()

from project.models import Project
from tasks.models import Task
from users.models import CustomUser

# Get the first project and admin user
project = Project.objects.first()
admin = CustomUser.objects.filter(is_superuser=True).first()

if not project:
    print("❌ No project found! Run create_test_data.py first.")
    exit(1)

if not admin:
    print("❌ No admin user found!")
    exit(1)

# Create a task with invalid status
task = Task.objects.create(
    title="Task with Invalid Status (from Excel Import)",
    description="This task was imported from Excel and has an invalid status",
    status="Pending",  # Invalid status - not in [To Do, In Progress, Done]
    priority="High",
    start_date=datetime.now().date(),
    due_date=datetime.now().date() + timedelta(days=3),
    duration=3,
    progress=0,
    project=project,
    assignee=admin
)

print(f"✅ Created task with invalid status: {task.title}")
print(f"   Status: '{task.status}' (should show in Invalid Status column)")

# Create another task with empty string status
task2 = Task.objects.create(
    title="Task with Different Invalid Status",
    description="This task has an unusual status from legacy system",
    status="Ongoing",  # Invalid status - not in valid list
    priority="Medium",
    start_date=datetime.now().date(),
    due_date=datetime.now().date() + timedelta(days=2),
    duration=2,
    progress=0,
    project=project,
    assignee=admin
)

print(f"✅ Created task with invalid status: {task2.title}")
print(f"   Status: '{task2.status}' (should show in Invalid Status column)")

# Create another task
task3 = Task.objects.create(
    title="Another Excel Import Task",
    description="Status from old system",
    status="Work In Progress",  # Invalid - has extra spaces/words
    priority="Low",
    start_date=datetime.now().date(),
    due_date=datetime.now().date() + timedelta(days=4),
    duration=4,
    progress=25,
    project=project,
    assignee=admin
)

print(f"✅ Created task with invalid status: {task3.title}")
print(f"   Status: '{task3.status}' (should show in Invalid Status column)")

print("\n📊 Summary:")
print(f"Valid statuses: To Do, In Progress, Done")
print(f"Invalid tasks created: 3")
print(f"\nRefresh the Kanban board to see these tasks in the 'Invalid Status' column!")
