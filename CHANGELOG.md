# Changelog

All notable changes to the Task Management System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Real-time collaboration with WebSockets
- Advanced analytics dashboard
- Mobile native applications
- AI-powered task recommendations
- Integration with third-party tools (Slack, Jira, Teams)

---

## [1.0.0] - 2025-10-14

### 🎉 Initial Release

#### Added

**Core Features:**
- ✨ Complete task management system with CRUD operations
- 📊 Interactive Gantt chart visualization
- 📋 Kanban board (Ticket View) with drag-and-drop
- 📑 Excel-style grid view for bulk editing
- 🎯 Advanced Critical Path Method (CPM) analysis
- 👥 User authentication and authorization
- 🔐 JWT-based secure authentication
- 📁 File attachment support for tasks
- 🔗 Task dependencies and relationships
- 📱 Fully responsive design

**Critical Path Method:**
- Automatic critical path calculation
- Topological sort using Kahn's algorithm
- Forward and backward pass calculations
- Early Start/Finish and Late Start/Finish metrics
- Total float/slack analysis
- Visual indicators for critical and near-critical tasks:
  - 🔴 Red pulsing icon for critical tasks (0 float)
  - 🟠 Orange warning icon for near-critical tasks (1-2 days float)
- Interactive tooltips with detailed CPM information
- Float analysis categorization

**User Interface:**
- Modern Material-UI design
- Dashboard with multiple view modes
- Project selector with real-time switching
- Task creation and editing forms
- Rich text descriptions
- Progress tracking visualizations
- Priority and status indicators
- Assignee avatars and username display

**Backend API:**
- RESTful API with Django REST Framework
- Swagger/OpenAPI documentation
- ReDoc API reference
- Token-based authentication
- CORS support for frontend integration
- Pagination and filtering
- Custom serializers for optimized data transfer

**Authentication:**
- User registration and login
- JWT token authentication
- Token refresh mechanism
- Google OAuth 2.0 integration
- Microsoft Azure AD integration
- Session management
- Password reset functionality

**Project Management:**
- Create and manage multiple projects
- Project-level task organization
- Project timeline tracking
- Project statistics and insights
- Unique project keys

**Task Features:**
- Hierarchical task structure (parent/subtasks)
- Task dependencies (prerequisite tasks)
- Multiple status options (To Do, In Progress, Done)
- Priority levels (High, Medium, Low)
- Due dates and duration tracking
- Progress percentage
- Task descriptions
- File attachments
- Task comments (foundation)

**Gantt Chart:**
- Interactive timeline visualization
- Task bars with duration display
- Expandable task groups
- Dependency relationship lines
- Color coding by status and priority
- Task detail panel
- Progress indicators
- Duration badges
- Subtask visualization
- Action menu for quick edits

**Kanban Board:**
- Three-column workflow (To Do, In Progress, Done)
- Drag-and-drop task movement
- Visual progress bars
- Priority badges
- Date and duration chips
- Subtask count indicators
- Dependency count display
- Quick task actions
- Assignee information

**Excel View:**
- Spreadsheet-style interface
- Inline editing capabilities
- Bulk operations support
- Sortable columns
- Filterable data
- Export functionality

**Development Features:**
- Django-React integration
- Production build configuration
- Environment variable management
- Static file serving
- Media file uploads
- Database migrations
- Admin panel customization

**Documentation:**
- Comprehensive README.md
- Installation guide
- Configuration instructions
- API documentation
- CPM algorithm explanation
- Deployment guides (Heroku, AWS, Docker)
- Contributing guidelines
- Code of Conduct
- Changelog

**Testing:**
- Backend unit tests
- Frontend component tests
- Integration tests
- CPM verification scripts
- Test coverage reporting

**DevOps:**
- Quick start scripts (start.bat)
- Integration checker (check_integration.py)
- CPM data verification (check_and_fix_cpm.py)
- Environment configuration templates
- Git ignore configuration
- Docker support (planned)

#### Technical Stack

**Backend:**
- Django 5.2.7
- Django REST Framework 3.16.1
- djangorestframework-simplejwt 5.5.1
- drf-yasg 1.21.11 (API docs)
- Python 3.11+
- SQLite 3 (development)
- PostgreSQL support (production)

**Frontend:**
- React 19.0.2
- Material-UI 6.3.1
- React Router 7.1.1
- Axios 1.7.9
- @dnd-kit/core 6.3.1 (drag-and-drop)
- date-fns 4.1.0
- Google OAuth (@react-oauth/google)
- Microsoft OAuth (@azure/msal-react)

#### Architecture

- RESTful API architecture
- Token-based authentication (JWT)
- Component-based frontend
- Model-View-Serializer backend pattern
- Single-page application (SPA)
- Responsive mobile-first design
- Production-ready build configuration

#### Performance

- Optimized React production build
- Code splitting and lazy loading
- Efficient database queries
- Indexed database fields for CPM
- Minified and compressed assets
- Fast CPM calculation (O(V+E) complexity)

#### Security

- JWT token authentication
- CSRF protection
- XSS prevention
- SQL injection protection (Django ORM)
- Secure password hashing
- CORS configuration
- Environment variable protection
- Secure file upload handling

#### Known Issues

- None reported in initial release

#### Dependencies

See `requirements.txt` (backend) and `package.json` (frontend) for complete dependency lists.

---

## Version History

### Version Numbering

We use Semantic Versioning:
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backward compatible manner
- **PATCH** version for backward compatible bug fixes

### Release Schedule

- **Major releases**: Quarterly (Q1, Q2, Q3, Q4)
- **Minor releases**: Monthly
- **Patch releases**: As needed for critical bugs

---

## Links

- [Homepage](https://github.com/aniket-verma-coforge/task-management)
- [Issue Tracker](https://github.com/aniket-verma-coforge/task-management/issues)
- [Source Code](https://github.com/aniket-verma-coforge/task-management)
- [Documentation](https://github.com/aniket-verma-coforge/task-management#readme)

---

## Contributors

Special thanks to all contributors who helped make this release possible!

- [@aniket-verma-coforge](https://github.com/aniket-verma-coforge) - Project Lead & Core Developer

Want to see your name here? Check out our [Contributing Guidelines](CONTRIBUTING.md)!

---

[Unreleased]: https://github.com/aniket-verma-coforge/task-management/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/aniket-verma-coforge/task-management/releases/tag/v1.0.0
