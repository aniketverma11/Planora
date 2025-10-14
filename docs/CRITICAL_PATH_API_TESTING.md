# Critical Path Method API Testing Guide

## 🧪 API Testing Examples

This guide provides curl commands and examples for testing the Critical Path Method (CPM) API endpoints.

---

## Prerequisites

1. **Backend Server Running**
   ```bash
   cd d:\coforge\MSCOE\task_management
   .\env\Scripts\activate
   python manage.py runserver 8001
   ```

2. **Authentication Token**
   - Login to get JWT token
   - Use token in Authorization header

---

## 🔐 Get Authentication Token

### Login
```bash
curl -X POST http://127.0.0.1:8001/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword"
  }'
```

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "user@example.com"
  }
}
```

**Save the token for subsequent requests.**

---

## 📊 Critical Path Endpoints

### 1. Get Critical Path Analysis

**Description:** Retrieve critical path analysis without saving to database.

**Endpoint:** `GET /api/tasks/critical_path/?project_id={id}`

**Example:**
```bash
curl -X GET "http://127.0.0.1:8001/api/tasks/critical_path/?project_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**PowerShell:**
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
}
Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/tasks/critical_path/?project_id=1" -Headers $headers -Method Get
```

**Success Response (200):**
```json
{
  "critical_tasks": [
    {
      "id": 1,
      "title": "Design Database Schema",
      "description": "Create initial database design",
      "duration": 5,
      "early_start": 0,
      "early_finish": 5,
      "late_start": 0,
      "late_finish": 5,
      "total_float": 0,
      "is_critical": true,
      "status": "In Progress",
      "progress": 50,
      "assignee_username": "john_doe"
    },
    {
      "id": 3,
      "title": "Implement API Endpoints",
      "description": "Create REST API endpoints",
      "duration": 7,
      "early_start": 5,
      "early_finish": 12,
      "late_start": 5,
      "late_finish": 12,
      "total_float": 0,
      "is_critical": true,
      "status": "To Do",
      "progress": 0,
      "assignee_username": "jane_smith"
    }
  ],
  "critical_paths": [
    [
      {
        "id": 1,
        "title": "Design Database Schema",
        "duration": 5,
        "early_start": 0,
        "early_finish": 5
      },
      {
        "id": 3,
        "title": "Implement API Endpoints",
        "duration": 7,
        "early_start": 5,
        "early_finish": 12
      },
      {
        "id": 5,
        "title": "Deploy to Production",
        "duration": 3,
        "early_start": 12,
        "early_finish": 15
      }
    ]
  ],
  "project_duration": 15,
  "earliest_completion": "2025-01-15",
  "latest_completion": "2025-01-15",
  "total_tasks": 10,
  "critical_tasks_count": 5,
  "risk_level": "high"
}
```

**Error Response (400) - Circular Dependency:**
```json
{
  "error": "Circular dependency detected in task dependencies. Please check your task relationships."
}
```

**Error Response (400) - Missing Project ID:**
```json
{
  "error": "project_id query parameter is required"
}
```

---

### 2. Calculate and Save Critical Path

**Description:** Calculate critical path and persist results to database.

**Endpoint:** `POST /api/tasks/calculate_critical_path/`

**Example:**
```bash
curl -X POST http://127.0.0.1:8001/api/tasks/calculate_critical_path/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "project_id": 1
  }'
```

**PowerShell:**
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    project_id = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/tasks/calculate_critical_path/" -Headers $headers -Method Post -Body $body
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Critical path calculated and saved successfully",
  "total_tasks": 10,
  "critical_tasks": 5,
  "project_duration": 15,
  "risk_level": "high"
}
```

**What Happens:**
1. System calculates ES, EF, LS, LF for all tasks
2. Calculates total float for each task
3. Identifies critical tasks (float = 0)
4. Saves all CPM fields to database
5. Returns summary statistics

**Error Response (400) - Circular Dependency:**
```json
{
  "error": "Circular dependency detected in task dependencies"
}
```

---

### 3. Float Analysis

**Description:** Categorize tasks by float/slack level.

**Endpoint:** `GET /api/tasks/float_analysis/?project_id={id}`

**Example:**
```bash
curl -X GET "http://127.0.0.1:8001/api/tasks/float_analysis/?project_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**PowerShell:**
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
}
Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/tasks/float_analysis/?project_id=1" -Headers $headers -Method Get
```

**Success Response (200):**
```json
{
  "critical": [
    {
      "id": 1,
      "title": "Design Database Schema",
      "duration": 5,
      "total_float": 0,
      "status": "In Progress",
      "progress": 50,
      "assignee": {
        "id": 1,
        "username": "john_doe"
      }
    },
    {
      "id": 3,
      "title": "Implement API Endpoints",
      "duration": 7,
      "total_float": 0,
      "status": "To Do",
      "progress": 0,
      "assignee": {
        "id": 2,
        "username": "jane_smith"
      }
    }
  ],
  "near_critical": [
    {
      "id": 2,
      "title": "Write Unit Tests",
      "duration": 3,
      "total_float": 1,
      "status": "To Do",
      "progress": 0,
      "assignee": {
        "id": 3,
        "username": "bob_johnson"
      }
    },
    {
      "id": 4,
      "title": "Code Review",
      "duration": 2,
      "total_float": 2,
      "status": "To Do",
      "progress": 0,
      "assignee": null
    }
  ],
  "normal": [
    {
      "id": 5,
      "title": "Update Documentation",
      "duration": 4,
      "total_float": 5,
      "status": "To Do",
      "progress": 0,
      "assignee": {
        "id": 1,
        "username": "john_doe"
      }
    }
  ],
  "summary": {
    "critical": 5,
    "near_critical": 3,
    "normal": 2,
    "total": 10
  }
}
```

**Float Categories:**
- **Critical**: 0 days float - Cannot be delayed
- **Near-Critical**: 1-2 days float - Very limited flexibility
- **Normal**: >2 days float - Good scheduling flexibility

---

## 🧩 Test Scenarios

### Scenario 1: Simple Linear Project

**Project Setup:**
```
Task A (5 days) → Task B (3 days) → Task C (7 days)
```

**Expected Result:**
- Project Duration: 15 days
- Critical Tasks: All 3 tasks (A, B, C)
- Critical Paths: 1 path with all tasks
- Risk Level: Critical (100% critical tasks)

**Test Steps:**
1. Create tasks with durations: A=5, B=3, C=7
2. Set dependencies: B depends on A, C depends on B
3. Call `/calculate_critical_path/`
4. Verify all tasks have float = 0

---

### Scenario 2: Parallel Tasks

**Project Setup:**
```
         → Task B (5 days) →
Task A (3 days)             → Task D (4 days)
         → Task C (7 days) →
```

**Expected Result:**
- Project Duration: 14 days (A=3 + C=7 + D=4)
- Critical Tasks: A, C, D
- Critical Path: A → C → D
- Non-Critical: Task B (has 2 days float)
- Risk Level: High (75% critical)

**Test Steps:**
1. Create tasks: A=3, B=5, C=7, D=4
2. Set dependencies:
   - B depends on A
   - C depends on A
   - D depends on B and C
3. Call `/calculate_critical_path/`
4. Verify:
   - A, C, D have float = 0
   - B has float = 2

---

### Scenario 3: Complex Network

**Project Setup:**
```
Task A (2 days) → Task C (4 days) → Task E (3 days)
                ↘                  ↗
                 Task D (5 days) →
```

**Expected Result:**
- Project Duration: 10 days (A=2 + D=5 + E=3)
- Critical Tasks: A, D, E
- Critical Path: A → D → E
- Non-Critical: Task C (has 1 day float)
- Risk Level: High (75% critical)

---

### Scenario 4: Circular Dependency (Error Case)

**Project Setup:**
```
Task A depends on Task B
Task B depends on Task C
Task C depends on Task A  ← Creates cycle!
```

**Expected Result:**
- Error: "Circular dependency detected"
- HTTP Status: 400 Bad Request
- No calculation performed

**Test Steps:**
1. Create tasks A, B, C
2. Set circular dependencies
3. Call `/calculate_critical_path/`
4. Verify error response

---

## 📝 Testing Checklist

### Backend API Tests

- [ ] **Authentication**
  - [ ] Request without token returns 401
  - [ ] Request with invalid token returns 401
  - [ ] Request with valid token succeeds

- [ ] **Get Critical Path**
  - [ ] Returns correct critical tasks
  - [ ] Returns all critical paths
  - [ ] Calculates correct project duration
  - [ ] Returns appropriate risk level
  - [ ] Handles circular dependencies gracefully

- [ ] **Calculate Critical Path**
  - [ ] Saves CPM fields to database
  - [ ] Returns success status
  - [ ] Handles missing project_id
  - [ ] Detects circular dependencies
  - [ ] Updates existing calculations

- [ ] **Float Analysis**
  - [ ] Correctly categorizes tasks
  - [ ] Returns accurate summary counts
  - [ ] Includes task details
  - [ ] Handles projects with no tasks

### Frontend Integration Tests

- [ ] **Critical Path Tab**
  - [ ] Tab appears in Dashboard
  - [ ] Loads data on mount
  - [ ] Displays project statistics
  - [ ] Shows critical paths
  - [ ] Renders critical tasks table
  - [ ] Displays float analysis

- [ ] **User Interactions**
  - [ ] Recalculate button works
  - [ ] Path expansion/collapse works
  - [ ] Loading states display correctly
  - [ ] Error messages show properly
  - [ ] Tooltips appear on hover

- [ ] **Data Accuracy**
  - [ ] ES, EF, LS, LF values correct
  - [ ] Float calculations accurate
  - [ ] Risk level appropriate
  - [ ] Dates formatted properly

---

## 🐛 Common Issues and Solutions

### Issue: 401 Unauthorized

**Cause:** Missing or expired authentication token

**Solution:**
```bash
# Get new token
curl -X POST http://127.0.0.1:8001/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use new token in subsequent requests
```

### Issue: Circular Dependency Error

**Cause:** Tasks have dependencies that form a loop

**Solution:**
1. List all task dependencies
2. Identify the circular path
3. Remove one dependency to break the cycle
4. Use Gantt Chart to visualize dependencies

### Issue: Empty Critical Path Response

**Possible Causes:**
- Project has no tasks
- Tasks have no dependencies
- No start dates set

**Solution:**
1. Verify project has tasks: `GET /api/tasks/?project_id=1`
2. Check task dependencies are set
3. Ensure tasks have start and end dates

---

## 📊 Database Queries for Verification

### Check CPM Fields

```sql
-- View CPM fields for all tasks in a project
SELECT 
    id, 
    title, 
    duration,
    early_start_day,
    early_finish_day,
    late_start_day,
    late_finish_day,
    total_float,
    is_critical
FROM tasks_task
WHERE project_id = 1
ORDER BY early_start_day;
```

### Find Critical Tasks

```sql
-- Get all critical tasks
SELECT 
    id, 
    title, 
    duration,
    total_float
FROM tasks_task
WHERE project_id = 1 AND is_critical = TRUE
ORDER BY early_start_day;
```

### Verify Dependencies

```sql
-- Check task dependencies
SELECT 
    t.id,
    t.title,
    GROUP_CONCAT(dep.title) as depends_on
FROM tasks_task t
LEFT JOIN tasks_task_dependencies td ON t.id = td.from_task_id
LEFT JOIN tasks_task dep ON td.to_task_id = dep.id
WHERE t.project_id = 1
GROUP BY t.id, t.title;
```

---

## 🔍 Monitoring and Debugging

### Enable Debug Logging

**Backend (Django):**
```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'tasks.critical_path': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

### Frontend Console Logging

Open browser DevTools (F12) and check Console tab for:
- API request logs (📤)
- Token validation logs (🔍)
- Response data logs (✅)
- Error messages (❌)

---

## 📈 Performance Testing

### Load Testing with Multiple Projects

```bash
# Test with 10 concurrent requests
for i in {1..10}; do
  curl -X GET "http://127.0.0.1:8001/api/tasks/critical_path/?project_id=$i" \
    -H "Authorization: Bearer YOUR_TOKEN" &
done
wait
```

### Large Project Testing

Test with projects containing:
- 50+ tasks
- Complex dependency networks
- Multiple critical paths

**Expected Performance:**
- Calculation time: <2 seconds for 50 tasks
- API response time: <500ms
- Database query time: <100ms

---

## ✅ Validation Rules

### Task Requirements
- ✅ Duration > 0
- ✅ Start date set
- ✅ End date set
- ✅ Assigned to project

### Dependency Rules
- ✅ No circular dependencies
- ✅ Predecessor task exists
- ✅ Both tasks in same project

### CPM Calculation Rules
- ✅ ES ≥ 0
- ✅ EF = ES + Duration
- ✅ LS ≥ ES
- ✅ LF ≥ EF
- ✅ Float = LS - ES (or LF - EF)
- ✅ Critical if Float = 0

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-14  
**Status:** Ready for Testing 🧪
