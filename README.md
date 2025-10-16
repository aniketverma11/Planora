# 📊 Task Management System

<div align="center">

![Task Management](https://img.shields.io/badge/planora-blue?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-5.2.7-green?style=for-the-badge&logo=django)
![React](https://img.shields.io/badge/React-19.0.2-61DAFB?style=for-the-badge&logo=react)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A comprehensive full-stack project management application with advanced Critical Path Method (CPM) analysis, Gantt charts, and real-time collaboration features.**

[Features](#-features) • [Demo](#-demo-screenshots) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Critical Path Method (CPM)](#-critical-path-method-cpm)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

The **Task Management System** is a modern, feature-rich project management platform designed to help teams plan, track, and execute projects efficiently. Built with Django REST Framework and React, it combines powerful backend capabilities with an intuitive, responsive user interface.

### 🎯 Why This Project?

- **📈 Project Planning**: Visualize project timelines with interactive Gantt charts
- **🎯 Critical Path Analysis**: Identify bottlenecks and optimize project schedules with CPM
- **👥 Team Collaboration**: Assign tasks, track progress, and collaborate in real-time
- **📊 Data-Driven Insights**: Make informed decisions with comprehensive analytics
- **🔒 Enterprise-Ready**: Secure authentication, role-based access, and audit trails

---

## ✨ Key Features

### 🎨 **User Interface**

<details>
<summary><b>Click to expand UI features</b></summary>

- **Modern Dashboard**: Clean, intuitive interface with Material-UI components
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Dark/Light Themes**: User-customizable themes for comfortable viewing
- **Real-time Updates**: Live data synchronization without page refreshes
- **Drag-and-Drop**: Intuitive task management with Kanban boards

</details>

### 📋 **Task Management**

<details>
<summary><b>Click to expand task features</b></summary>

- **Task Hierarchy**: Support for parent tasks and subtasks
- **Task Dependencies**: Define task relationships and prerequisites
- **Status Tracking**: Customizable workflow states (To Do, In Progress, Done)
- **Priority Levels**: High, Medium, Low priority classification
- **Progress Tracking**: Visual progress indicators and completion percentages
- **File Attachments**: Upload and manage task-related documents
- **Comments & Notes**: Collaborative commenting system for team communication

</details>

### 📊 **Project Visualization**

<details>
<summary><b>Click to expand visualization features</b></summary>

#### **Gantt Chart View**
- Interactive timeline visualization
- Drag-to-adjust task durations
- Dependency arrows showing task relationships
- Color-coded by status and priority
- Expandable/collapsible task groups
- Milestone markers
- Export to PDF/Excel

#### **Kanban Board (Ticket View)**
- Column-based workflow visualization
- Drag-and-drop task movement
- WIP (Work In Progress) limits
- Swimlane organization
- Real-time updates

#### **Excel View**
- Spreadsheet-style task editing
- Bulk operations support
- Import/Export functionality
- Formula support for calculations
- Filter and sort capabilities

</details>

### 🎯 **Critical Path Method (CPM)**

<details>
<summary><b>Click to expand CPM features</b></summary>

Our implementation includes advanced CPM analysis:

- **Automatic Critical Path Calculation**: Identifies the longest path through your project
- **Float/Slack Analysis**: Calculates total float for each task
- **Early/Late Start/Finish**: Computes ES, EF, LS, LF for all tasks
- **Visual Indicators**:
  - 🔴 **Critical Tasks** (0 days float) - Red pulsing icon
  - 🟠 **Near-Critical Tasks** (1-2 days float) - Orange warning icon
  - 🟢 **Normal Tasks** (>2 days float) - No special indicator
- **Interactive Tooltips**: Detailed CPM metrics on hover
- **Multiple Critical Paths**: Detects and highlights all critical paths
- **What-If Scenarios**: Analyze impact of task duration changes
- **Network Diagram**: PERT chart visualization
- **Resource Leveling**: Optimize resource allocation

#### **CPM Algorithm Details**
- **Topological Sort**: Kahn's algorithm for dependency ordering
- **Forward Pass**: Calculate Early Start and Early Finish
- **Backward Pass**: Calculate Late Start and Late Finish
- **Float Calculation**: Total Float = LS - ES = LF - EF
- **Complexity**: O(V + E) where V = tasks, E = dependencies

</details>

### 🔐 **Authentication & Security**

<details>
<summary><b>Click to expand security features</b></summary>

- **JWT Authentication**: Secure token-based authentication
- **OAuth Integration**: 
  - Google OAuth 2.0
  - Microsoft Azure AD
- **Session Management**: Automatic token refresh
- **Role-Based Access Control (RBAC)**: Granular permissions
- **Password Security**: Bcrypt hashing with salt
- **CORS Protection**: Configured for secure cross-origin requests
- **CSRF Protection**: Django CSRF middleware
- **XSS Prevention**: Content Security Policy headers

</details>

### 📱 **API Features**

<details>
<summary><b>Click to expand API features</b></summary>

- **RESTful API**: Django REST Framework endpoints
- **Swagger/OpenAPI**: Interactive API documentation
- **ReDoc**: Beautiful API reference documentation
- **Pagination**: Efficient data loading with page-based pagination
- **Filtering**: Advanced query parameters for data filtering
- **Sorting**: Multi-field sorting capabilities
- **Versioning**: API version management
- **Rate Limiting**: Prevent abuse and ensure fair usage
- **Webhooks**: Real-time event notifications

</details>

---

## 🛠 Technology Stack

### **Backend**

| Technology | Version | Purpose |
|------------|---------|---------|
| ![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python) | 3.11+ | Core programming language |
| ![Django](https://img.shields.io/badge/Django-5.2.7-green?logo=django) | 5.2.7 | Web framework |
| ![DRF](https://img.shields.io/badge/DRF-3.16.1-red) | 3.16.1 | REST API framework |
| ![JWT](https://img.shields.io/badge/JWT-2.10.1-black) | 2.10.1 | Authentication |
| ![SQLite](https://img.shields.io/badge/SQLite-3-blue?logo=sqlite) | 3 | Database (dev) |

**Key Backend Libraries:**
- `djangorestframework-simplejwt` - JWT tokens
- `drf-yasg` - API documentation
- `django-cors-headers` - CORS handling
- `python-decouple` - Environment configuration
- `Pillow` - Image processing

### **Frontend**

| Technology | Version | Purpose |
|------------|---------|---------|
| ![React](https://img.shields.io/badge/React-19.0.2-61DAFB?logo=react) | 19.0.2 | UI framework |
| ![Material-UI](https://img.shields.io/badge/MUI-6.3.1-007FFF?logo=mui) | 6.3.1 | Component library |
| ![Axios](https://img.shields.io/badge/Axios-1.7.9-purple) | 1.7.9 | HTTP client |
| ![React Router](https://img.shields.io/badge/React_Router-7.1.1-CA4245?logo=react-router) | 7.1.1 | Routing |

**Key Frontend Libraries:**
- `@dnd-kit/core` - Drag-and-drop functionality
- `@mui/x-date-pickers` - Date/time pickers
- `react-oauth/google` - Google OAuth
- `@azure/msal-react` - Microsoft authentication
- `date-fns` - Date manipulation

---

## 🏗 Architecture

### **System Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  React   │  │Material  │  │  React   │  │  Axios   │       │
│  │   App    │  │   UI     │  │  Router  │  │  Client  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Django Web Server                           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │   REST     │  │    JWT     │  │   CORS     │        │   │
│  │  │    API     │  │    Auth    │  │  Handling  │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       Business Logic Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Tasks   │  │ Projects │  │  Users   │  │   CPM    │       │
│  │   App    │  │   App    │  │   App    │  │  Engine  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         Data Layer                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  SQLite Database                         │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐        │   │
│  │  │ Users  │  │ Tasks  │  │Projects│  │ Files  │        │   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### **Data Model (ER Diagram)**

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Project    │         │     Task     │         │  CustomUser  │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │1      * │ id (PK)      │*      1 │ id (PK)      │
│ name         │─────────│ project_id   │─────────│ username     │
│ key          │         │ title        │         │ email        │
│ description  │         │ description  │         │ first_name   │
│ start_date   │         │ status       │         │ last_name    │
│ end_date     │         │ priority     │         │ is_active    │
│ created_at   │         │ start_date   │         │ created_at   │
│ created_by   │         │ due_date     │         └──────────────┘
└──────────────┘         │ duration     │                │
                         │ progress     │                │
                         │ parent_task  │                │
                         │ assignee_id  │────────────────┘
                         │ created_by   │
                         │ created_at   │
                         │ CPM Fields:  │
                         │ - is_critical│
                         │ - total_float│
                         │ - early_start│
                         │ - early_finish
                         │ - late_start │
                         │ - late_finish│
                         └──────────────┘
                                │
                                │ M:N
                                ↓
                         ┌──────────────┐
                         │ Dependencies │
                         ├──────────────┤
                         │ from_task_id │
                         │ to_task_id   │
                         └──────────────┘
```

---

## 📥 Installation

### **Prerequisites**

Before you begin, ensure you have the following installed:

- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm 9+** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/downloads))

### **Quick Start (5 Minutes)**

#### **1. Clone the Repository**

```bash
git clone https://github.com/aniketverma11/planora.git
cd planora
```

#### **2. Backend Setup**

```bash
# Create virtual environment
python -m venv env

# Activate virtual environment
# Windows:
.\env\Scripts\activate
# Linux/Mac:
source env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load sample data (optional)
python manage.py loaddata sample_data.json
```

#### **3. Frontend Setup**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build production version
npm run build

# Return to root directory
cd ..
```

#### **4. Run the Application**

```bash
# Option 1: Use quick start script (Windows)
start.bat

# Option 2: Manual start
.\env\Scripts\python.exe manage.py runserver 8001
```

#### **5. Access the Application**

Open your browser and navigate to:

- **Application**: http://localhost:8001/
- **Django Admin**: http://localhost:8001/admin/
- **API Documentation**: http://localhost:8001/swagger/

**Default Login Credentials** (if using sample data):
- Username: `admin`
- Password: `admin123`

---

## ⚙️ Configuration

### **Environment Variables**

Create a `.env` file in the root directory:

```properties
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (for production)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_TENANT_ID=common

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Configuration (optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### **Frontend Configuration**

Create `frontend/.env.production`:

```properties
# API Configuration
REACT_APP_API_URL=/api

# OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_MICROSOFT_CLIENT_ID=your-microsoft-client-id
REACT_APP_MICROSOFT_TENANT_ID=common
```

---

## 📖 Usage

### **Dashboard Overview**

The main dashboard provides quick access to:

1. **Project Selector**: Switch between projects
2. **View Tabs**:
   - **Ticket View**: Kanban board for task management
   - **Gantt Chart**: Timeline visualization
   - **Excel View**: Spreadsheet-style editing
   - **Critical Path**: CPM analysis and insights

### **Creating a Project**

1. Click **"+ New Project"** button
2. Fill in project details:
   - Project Name
   - Project Key (unique identifier)
   - Description
   - Start/End dates
3. Click **"Create Project"**

### **Adding Tasks**

1. Select a project from the dropdown
2. Click **"+ ADD TASK"** button
3. Fill in task details:
   - Title
   - Description
   - Status (To Do, In Progress, Done)
   - Priority (High, Medium, Low)
   - Start Date & Due Date
   - Duration (in days)
   - Assignee
   - Parent Task (if subtask)
   - Dependencies (prerequisite tasks)
4. Click **"Save"**

### **Using Critical Path Analysis**

1. Navigate to **Critical Path** tab
2. Click **"Calculate Critical Path"** button
3. View results:
   - **Statistics**: Project completion date, critical tasks count
   - **Critical Paths**: All paths from start to finish
   - **Task Table**: Sortable table with CPM metrics
   - **Float Analysis**: Tasks categorized by slack time

### **Exporting Data**

- **Gantt Chart**: Click export button → Choose PDF or Excel
- **Excel View**: Use built-in export functionality
- **API**: Access `/api/tasks/?format=json` for JSON export

---

## 📚 API Documentation

### **Authentication**

All API requests require authentication using JWT tokens.

#### **Obtain Token**

```http
POST /api/token/
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### **Use Token**

```http
GET /api/tasks/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### **Key Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/token/` | POST | Obtain JWT token |
| `/api/token/refresh/` | POST | Refresh access token |
| `/api/users/register/` | POST | Register new user |
| `/api/projects/` | GET, POST | List/create projects |
| `/api/projects/{id}/` | GET, PUT, DELETE | Project details |
| `/api/tasks/` | GET, POST | List/create tasks |
| `/api/tasks/{id}/` | GET, PUT, PATCH, DELETE | Task details |
| `/api/tasks/{id}/calculate-critical-path/` | POST | Calculate CPM |
| `/api/tasks/critical-path/` | GET | Get critical path |
| `/api/tasks/float-analysis/` | GET | Get float analysis |

### **Interactive Documentation**

Visit these URLs when the server is running:

- **Swagger UI**: http://localhost:8001/swagger/
- **ReDoc**: http://localhost:8001/redoc/

---

## 🎯 Critical Path Method (CPM)

### **What is CPM?**

The Critical Path Method is a project management technique used to identify the sequence of crucial steps that determine the minimum time needed to complete a project.

### **How It Works**

Our CPM implementation uses a sophisticated algorithm:

```python
def calculate_critical_path(project_id):
    """
    Calculate critical path using topological sort and forward/backward pass
    
    Steps:
    1. Topological Sort (Kahn's Algorithm)
       - Order tasks based on dependencies
       - Detect circular dependencies
    
    2. Forward Pass
       - Calculate Early Start (ES) and Early Finish (EF)
       - ES = max(EF of all predecessors)
       - EF = ES + Duration
    
    3. Backward Pass
       - Calculate Late Finish (LF) and Late Start (LS)
       - LF = min(LS of all successors)
       - LS = LF - Duration
    
    4. Float Calculation
       - Total Float = LS - ES = LF - EF
       - Critical tasks: Float = 0
       - Near-critical: Float = 1-2 days
    
    5. Critical Path Identification
       - Follow tasks with zero float
       - May have multiple critical paths
    """
```

### **CPM Metrics Explained**

| Metric | Symbol | Description |
|--------|--------|-------------|
| **Early Start** | ES | Earliest time a task can start |
| **Early Finish** | EF | Earliest time a task can finish |
| **Late Start** | LS | Latest time a task can start without delay |
| **Late Finish** | LF | Latest time a task can finish without delay |
| **Total Float** | TF | Slack time available (LS - ES) |
| **Critical** | - | Tasks with zero float (TF = 0) |
| **Near-Critical** | - | Tasks with minimal float (TF = 1-2) |

### **Visual Indicators**

Our system provides real-time visual feedback:

- 🔴 **Critical Tasks** (Red pulsing icon)
  - 0 days of float
  - Any delay impacts project completion
  - Requires immediate attention

- 🟠 **Near-Critical Tasks** (Orange warning icon)
  - 1-2 days of float
  - Close to becoming critical
  - Monitor closely

- 🟢 **Normal Tasks**
  - >2 days of float
  - Flexible scheduling
  - Low risk

### **Use Cases**

1. **Project Planning**: Identify which tasks to prioritize
2. **Resource Allocation**: Assign best resources to critical tasks
3. **Risk Management**: Monitor near-critical tasks
4. **Schedule Optimization**: Find opportunities to shorten project duration
5. **What-If Analysis**: Evaluate impact of delays or changes

---

## 📁 Project Structure

```
planora/
│
├── 📂 frontend/                     # React frontend application
│   ├── 📂 build/                    # Production build (served by Django)
│   ├── 📂 public/                   # Static assets
│   ├── 📂 src/
│   │   ├── 📂 components/           # React components
│   │   │   ├── Dashboard.js         # Main dashboard
│   │   │   ├── KanbanBoard.js       # Ticket view
│   │   │   ├── GanttChart.js        # Gantt visualization
│   │   │   ├── ExcelView.js         # Excel-style view
│   │   │   ├── CriticalPathView.js  # CPM analysis
│   │   │   ├── TaskForm.js          # Task creation/editing
│   │   │   └── ...
│   │   ├── 📂 services/
│   │   │   └── api.js               # API client
│   │   ├── App.js                   # Root component
│   │   └── index.js                 # Entry point
│   ├── .env                         # Development config
│   ├── .env.production              # Production config
│   └── package.json                 # Dependencies
│
├── 📂 task_management/              # Django project settings
│   ├── __init__.py
│   ├── asgi.py                      # ASGI configuration
│   ├── settings.py                  # Django settings
│   ├── urls.py                      # Main URL configuration
│   ├── views.py                     # React app view
│   └── wsgi.py                      # WSGI configuration
│
├── 📂 tasks/                        # Tasks Django app
│   ├── 📂 migrations/               # Database migrations
│   ├── __init__.py
│   ├── admin.py                     # Admin configuration
│   ├── apps.py                      # App configuration
│   ├── models.py                    # Task model
│   ├── serializers.py               # DRF serializers
│   ├── views.py                     # API views
│   ├── urls.py                      # Task URLs
│   ├── critical_path.py             # CPM algorithm
│   └── tests.py                     # Unit tests
│
├── 📂 users/                        # Users Django app
│   ├── 📂 migrations/
│   ├── models.py                    # CustomUser model
│   ├── serializers.py               # User serializers
│   ├── views.py                     # Auth views
│   └── urls.py                      # User URLs
│
├── 📂 project/                      # Projects Django app
│   ├── 📂 migrations/
│   ├── models.py                    # Project model
│   ├── serializers.py               # Project serializers
│   ├── views.py                     # Project views
│   └── urls.py                      # Project URLs
│
├── 📂 media/                        # User uploaded files
├── 📂 staticfiles/                  # Collected static files
├── 📂 env/                          # Python virtual environment
│
├── 📄 db.sqlite3                    # SQLite database
├── 📄 manage.py                     # Django management script
├── 📄 requirements.txt              # Python dependencies
├── 📄 start.bat                     # Quick start script
├── 📄 check_integration.py          # Integration checker
├── 📄 check_and_fix_cpm.py          # CPM verification script
│
├── 📄 README.md                     # This file
├── 📄 DJANGO_REACT_INTEGRATION.md   # Integration guide
├── 📄 QUICKSTART.md                 # Quick reference
├── 📄 SERVER_RUNNING.md             # Server status
└── 📄 .gitignore                    # Git ignore rules
```

---

## 💻 Development

### **Development Mode (Hot Reload)**

For active development with hot reloading:

**Terminal 1 - Backend:**
```bash
.\env\Scripts\python.exe manage.py runserver 8001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Access:
- Frontend (dev): http://localhost:3000
- Backend API: http://localhost:8001/api/

### **Code Style**

**Python (Backend):**
- Follow PEP 8 style guide
- Use type hints where applicable
- Maximum line length: 100 characters

```bash
# Format code
pip install black
black .

# Lint code
pip install flake8
flake8 .
```

**JavaScript (Frontend):**
- Use ESLint for linting
- Prettier for formatting
- Follow React best practices

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### **Database Migrations**

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations

# Revert migration
python manage.py migrate tasks 0005_previous_migration
```

### **Adding New Features**

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Make changes**
   - Backend: Update models, views, serializers
   - Frontend: Create/update components

3. **Test changes**
   ```bash
   # Backend tests
   python manage.py test
   
   # Frontend tests
   cd frontend
   npm test
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "Add new feature: description"
   git push origin feature/new-feature-name
   ```

5. **Create Pull Request**

---

## 🧪 Testing

### **Backend Tests**

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test tasks

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generate HTML report
```

### **Frontend Tests**

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- TaskForm.test.js
```

### **Integration Tests**

```bash
# Verify integration
python check_integration.py

# Verify CPM data
python check_and_fix_cpm.py
```

### **Manual Testing Checklist**

- [ ] User registration and login
- [ ] Project creation and management
- [ ] Task CRUD operations
- [ ] Task dependencies
- [ ] File uploads
- [ ] Gantt chart interactions
- [ ] Kanban drag-and-drop
- [ ] CPM calculations
- [ ] Critical path visualization
- [ ] API authentication
- [ ] Admin panel access

---

## 🚀 Deployment

### **Production Setup**

#### **1. Environment Configuration**

```bash
# Update .env for production
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:pass@host:5432/db
```

#### **2. Build Frontend**

```bash
cd frontend
npm run build
cd ..
```

#### **3. Collect Static Files**

```bash
python manage.py collectstatic --noinput
```

#### **4. Database Migration**

```bash
python manage.py migrate
```

### **Deployment Options**

<details>
<summary><b>Option 1: Heroku</b></summary>

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate

# Create superuser
heroku run python manage.py createsuperuser
```

</details>

<details>
<summary><b>Option 2: AWS (EC2 + RDS)</b></summary>

1. **Launch EC2 Instance**
   - Ubuntu 20.04 LTS
   - t2.medium or larger
   - Configure security groups (ports 80, 443, 22)

2. **Set up RDS PostgreSQL**
   - Create database instance
   - Note connection details

3. **Deploy Application**
   ```bash
   # SSH into EC2
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Install dependencies
   sudo apt update
   sudo apt install python3-pip nginx
   
   # Clone repository
   git clone your-repo-url
   cd planora
   
   # Set up virtual environment
   python3 -m venv env
   source env/bin/activate
   pip install -r requirements.txt
   pip install gunicorn
   
   # Configure environment
   nano .env  # Add production settings
   
   # Collect static files
   python manage.py collectstatic
   
   # Run with Gunicorn
   gunicorn task_management.wsgi:application --bind 0.0.0.0:8000
   ```

4. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location /static/ {
           alias /path/to/staticfiles/;
       }
       
       location /media/ {
           alias /path/to/media/;
       }
       
       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

</details>

<details>
<summary><b>Option 3: Docker</b></summary>

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "task_management.wsgi:application", "--bind", "0.0.0.0:8000"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: taskmanagement
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  web:
    build: .
    command: gunicorn task_management.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/taskmanagement

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

**Deploy:**
```bash
docker-compose up -d
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py createsuperuser
```

</details>

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### **Getting Started**

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/planora.git
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes**
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### **Contribution Guidelines**

- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Follow existing code style
- Ensure all tests pass before submitting PR

### **Code of Conduct**

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism gracefully
- Focus on what's best for the community

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Task Management System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support & Contact

### **Need Help?**

- 📧 **Email**: support@taskmanagement.com
- 💬 **Discord**: [Join our community](https://discord.gg/taskmanagement)
- 📖 **Documentation**: [Full documentation](https://docs.taskmanagement.com)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/aniketverma11/planora/issues)

### **FAQ**

<details>
<summary><b>How do I reset my password?</b></summary>

Use the "Forgot Password" link on the login page, or contact an administrator to reset it from the Django admin panel.

</details>

<details>
<summary><b>Can I use this for commercial projects?</b></summary>

Yes! This project is MIT licensed, which allows commercial use. Please review the LICENSE file for full details.

</details>

<details>
<summary><b>How do I add custom fields to tasks?</b></summary>

1. Modify the Task model in `tasks/models.py`
2. Create and run migrations
3. Update serializers and forms
4. Update frontend components

</details>

<details>
<summary><b>Is there a mobile app?</b></summary>

Currently, we have a responsive web application that works well on mobile browsers. A native mobile app is planned for future releases.

</details>

---

## 🙏 Acknowledgments

- **Django** - The web framework for perfectionists with deadlines
- **React** - A JavaScript library for building user interfaces
- **Material-UI** - React components for faster and easier web development
- **DRF** - Powerful and flexible toolkit for building Web APIs
- **All Contributors** - Thanks to everyone who has contributed to this project!

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/aniketverma11/planora?style=social)
![GitHub forks](https://img.shields.io/github/forks/aniketverma11/planora?style=social)
![GitHub issues](https://img.shields.io/github/issues/aniketverma11/planora)
![GitHub pull requests](https://img.shields.io/github/issues-pr/aniketverma11/planora)
![GitHub last commit](https://img.shields.io/github/last-commit/aniketverma11/planora)
![GitHub code size](https://img.shields.io/github/languages/code-size/aniketverma11/planora)

---

## 🗺 Roadmap

### **Version 2.0** (Q2 2025)
- [ ] Real-time collaboration with WebSockets
- [ ] Advanced reporting and analytics
- [ ] Resource management module
- [ ] Time tracking integration
- [ ] Mobile native apps (iOS/Android)

### **Version 2.1** (Q3 2025)
- [ ] AI-powered task suggestions
- [ ] Automated scheduling optimization
- [ ] Integration with Slack, Teams, Jira
- [ ] Custom workflow builder
- [ ] Multi-language support

### **Version 3.0** (Q4 2025)
- [ ] Enterprise features (SSO, LDAP)
- [ ] Advanced permissions system
- [ ] Portfolio management
- [ ] Budget tracking
- [ ] Risk management tools

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ by the Task Management Team**

[Report Bug](https://github.com/aniketverma11/planora/issues) • [Request Feature](https://github.com/aniketverma11/planora/issues)

</div>
