# Contributing to Task Management System

First off, thank you for considering contributing to Task Management System! It's people like you that make this project such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Style Guidelines](#style-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

### Our Pledge

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to a positive environment:

* Using welcoming and inclusive language
* Being respectful of differing viewpoints and experiences
* Gracefully accepting constructive criticism
* Focusing on what is best for the community
* Showing empathy towards other community members

Examples of unacceptable behavior:

* The use of sexualized language or imagery
* Trolling, insulting/derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information without explicit permission
* Other conduct which could reasonably be considered inappropriate in a professional setting

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- Python 3.11+
- Node.js 18+
- Git
- A GitHub account

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/task-management.git
   cd task-management
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/aniketverma11/task-management.git
   ```

### Set Up Development Environment

1. **Backend Setup**:
   ```bash
   python -m venv env
   .\env\Scripts\activate  # Windows
   # source env/bin/activate  # Linux/Mac
   pip install -r requirements.txt
   python manage.py migrate
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   ```

3. **Run in Development Mode**:
   ```bash
   # Terminal 1 - Backend
   python manage.py runserver 8001
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g., Windows 10]
 - Browser: [e.g., Chrome 96]
 - Version: [e.g., 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

**Enhancement Template:**

```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Contributing Code

1. **Find an Issue**: Look for issues labeled `good first issue` or `help wanted`
2. **Comment**: Let others know you're working on it
3. **Create Branch**: Create a feature branch from `main`
4. **Make Changes**: Implement your changes
5. **Test**: Ensure all tests pass
6. **Submit PR**: Create a pull request

## 💻 Development Process

### Branch Naming Convention

Use descriptive branch names:

- `feature/add-gantt-zoom` - New features
- `bugfix/fix-task-deletion` - Bug fixes
- `hotfix/critical-security-fix` - Critical fixes
- `docs/update-readme` - Documentation updates
- `refactor/optimize-cpm-algorithm` - Code refactoring
- `test/add-task-tests` - Adding tests

### Making Changes

1. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write clean, readable code
   - Follow existing code style
   - Add comments where necessary
   - Update documentation if needed

3. **Test your changes**:
   ```bash
   # Backend tests
   python manage.py test
   
   # Frontend tests
   cd frontend
   npm test
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add zoom functionality to Gantt chart"
   ```

5. **Keep your branch updated**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Style Guidelines

### Python (Backend)

Follow PEP 8 style guide:

```python
# Good
def calculate_critical_path(project_id: int) -> dict:
    """
    Calculate the critical path for a given project.
    
    Args:
        project_id: The ID of the project
        
    Returns:
        Dictionary containing critical path information
    """
    tasks = Task.objects.filter(project_id=project_id)
    # Implementation...
    return {
        'critical_path': critical_path,
        'completion_date': completion_date
    }

# Bad
def calc_cp(pid):
    tasks=Task.objects.filter(project_id=pid)
    return cp
```

**Python Style Rules:**
- Maximum line length: 100 characters
- Use type hints for function arguments and return values
- Write docstrings for all functions and classes
- Use meaningful variable names
- Imports should be grouped: stdlib, third-party, local

### JavaScript/React (Frontend)

Follow Airbnb JavaScript Style Guide:

```javascript
// Good
const TaskCard = ({ task, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSubmit = useCallback((data) => {
    onUpdate(task.id, data);
    setIsEditing(false);
  }, [task.id, onUpdate]);
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{task.title}</Typography>
        {isEditing && <TaskForm onSubmit={handleSubmit} />}
      </CardContent>
    </Card>
  );
};

// Bad
function taskcard(props) {
  var editing = false
  return <div>{props.task.title}</div>
}
```

**JavaScript Style Rules:**
- Use `const` and `let`, avoid `var`
- Use arrow functions for callbacks
- Use destructuring for props
- Use meaningful component and variable names
- Use PropTypes or TypeScript for type checking

### CSS/Styling

```css
/* Good - Use BEM naming */
.task-card {
  padding: 16px;
  border-radius: 8px;
}

.task-card__header {
  font-size: 18px;
  font-weight: bold;
}

.task-card__header--critical {
  color: #d32f2f;
}

/* Bad */
.tc {
  padding: 16px;
}

.header {
  font-size: 18px;
}
```

## 💬 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes to build system or dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

### Examples

```bash
feat(gantt): add zoom controls to Gantt chart

Add zoom in/out functionality to the Gantt chart view with
keyboard shortcuts (Ctrl + +/-) and mouse wheel support.

Closes #123

---

fix(cpm): correct float calculation for parallel tasks

The previous implementation didn't handle parallel task paths
correctly. This fix ensures proper float calculation when
multiple tasks run simultaneously.

Fixes #456

---

docs(readme): update installation instructions

Add detailed steps for Windows, Linux, and macOS installation.
Include troubleshooting section for common issues.
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update your branch**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**:
   ```bash
   # Backend
   python manage.py test
   
   # Frontend
   cd frontend
   npm test
   ```

3. **Lint your code**:
   ```bash
   # Backend
   flake8 .
   
   # Frontend
   npm run lint
   ```

4. **Update documentation** if you've added/changed features

### PR Template

When creating a PR, use this template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran to verify your changes.

- [ ] Test A
- [ ] Test B

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Related Issues
Closes #(issue number)
```

### Review Process

1. **Maintainers will review** your PR within 3-5 business days
2. **Address feedback**: Make requested changes promptly
3. **Re-request review** after making changes
4. **Squash commits** if requested before merge
5. **Celebrate** when your PR is merged! 🎉

### Getting Your PR Merged

For your PR to be accepted, it must:

- Pass all automated tests
- Have approval from at least one maintainer
- Follow all style guidelines
- Include appropriate tests
- Update documentation if needed
- Have a clear, descriptive title and description

## 🧪 Testing Guidelines

### Writing Tests

**Backend Tests (Python/Django):**

```python
from django.test import TestCase
from tasks.models import Task
from tasks.critical_path import calculate_critical_path

class CriticalPathTestCase(TestCase):
    def setUp(self):
        """Set up test data"""
        self.project = Project.objects.create(name="Test Project")
        
    def test_simple_critical_path(self):
        """Test critical path with linear dependencies"""
        task1 = Task.objects.create(
            project=self.project,
            title="Task 1",
            duration=5
        )
        task2 = Task.objects.create(
            project=self.project,
            title="Task 2",
            duration=3
        )
        task2.dependencies.add(task1)
        
        result = calculate_critical_path(self.project.id)
        
        self.assertTrue(task1.is_critical)
        self.assertTrue(task2.is_critical)
        self.assertEqual(result['total_duration'], 8)
```

**Frontend Tests (JavaScript/React):**

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from './TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    is_critical: true,
    total_float: 0
  };
  
  it('displays critical icon for critical tasks', () => {
    render(<TaskCard task={mockTask} />);
    
    const criticalIcon = screen.getByTestId('critical-icon');
    expect(criticalIcon).toBeInTheDocument();
  });
  
  it('calls onUpdate when task is edited', () => {
    const mockOnUpdate = jest.fn();
    render(<TaskCard task={mockTask} onUpdate={mockOnUpdate} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    // ... rest of test
  });
});
```

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)

## ❓ Questions?

If you have questions:

1. Check existing [GitHub Discussions](https://github.com/aniketverma11/task-management/discussions)
2. Ask in our [Discord community](https://discord.gg/taskmanagement)
3. Create a new discussion on GitHub

## 🎉 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Project website (coming soon)

Thank you for making Task Management System better! 🚀
