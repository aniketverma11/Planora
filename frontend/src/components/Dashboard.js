import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Tabs,
  Tab,
  Box,
  Menu,
  MenuItem,
} from '@mui/material';
import { ExitToApp, AccountCircle } from '@mui/icons-material';
import TaskList from './TaskList';
import GanttChart from './GanttChart';
import KanbanBoard from './KanbanBoard';
import TokenExpiryTimer from './TokenExpiryTimer';
import { getAllTasks, deleteTask } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TabPanel = (props) => {
  const { children, value, index, noPadding, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: noPadding ? 0 : 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const GanttChartView = () => {
    const [data, setData] = useState({ data: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAndFormatTasks = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Use the API service instead of direct fetch
            const response = await getAllTasks();
            const tasks = response.data;
                
                if (!Array.isArray(tasks)) {
                    throw new Error('Invalid tasks data received');
                }
                
                const formattedTasks = tasks.map(task => {
                    // Ensure we have valid dates
                    let startDate = task.start_date;
                    if (!startDate) {
                        if (task.due_date && task.duration) {
                            const dueDate = new Date(task.due_date);
                            const startDateObj = new Date(dueDate.getTime() - (task.duration - 1) * 24 * 60 * 60 * 1000);
                            startDate = startDateObj.toISOString().split('T')[0];
                        } else {
                            startDate = new Date().toISOString().split('T')[0];
                        }
                    }
                    
                    return {
                        id: task.id,
                        text: task.title || 'Untitled Task',
                        start_date: startDate,
                        duration: Math.max(1, task.duration || 1),
                        progress: Math.max(0, task.progress || 0), // Keep as percentage (0-100)
                        parent: task.parent_task || 0,
                        open: true,
                        status: task.status,
                        priority: task.priority,
                        assignee: task.assignee,
                        subtasks: task.subtasks || [],
                        dependencies: task.dependencies || []
                    };
                });

                const formattedLinks = tasks
                    .filter(task => task.dependencies && Array.isArray(task.dependencies) && task.dependencies.length > 0)
                    .flatMap(task => 
                        task.dependencies.map((depId, index) => ({
                            id: `link_${depId}_${task.id}_${index}`,
                            source: depId,
                            target: task.id,
                            type: '0'
                        }))
                    );

                setData({ data: formattedTasks, links: formattedLinks });
            } catch (error) {
                console.error('Failed to fetch or format tasks for Gantt chart:', error);
                setError(error.message || 'Failed to load Gantt chart data');
                setData({ data: [], links: [] });
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        fetchAndFormatTasks();
    }, []);

    if (loading) {
        return (
            <div style={{ width: '100%', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>Loading Gantt Chart...</Typography>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ width: '100%', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="error">Error: {error}</Typography>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100vh', padding: '0', margin: '0' }}>
            <GanttChart tasks={data} onRefresh={fetchAndFormatTasks} />
        </div>
    );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [value, setValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [tasks, setTasks] = useState({ data: [] });
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const response = await getAllTasks();
      const formattedTasks = response.data.map(task => ({
        id: task.id,
        text: task.title || 'Untitled Task',
        start_date: task.start_date || new Date().toISOString().split('T')[0],
        duration: Math.max(1, task.duration || 1),
        progress: Math.max(0, task.progress || 0),
        parent: task.parent_task || 0,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        description: task.description,
        dependencies: task.dependencies || []
      }));
      setTasks({ data: formattedTasks });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleEditTask = (task) => {
    setEditingTask(task);
    // You can open a task form dialog here
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm(`Delete "${task.text}"?`)) {
      try {
        await deleteTask(task.id);
        fetchTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/login');
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task Management
          </Typography>
          
          {/* Token expiry timer */}
          <TokenExpiryTimer />
          
          {/* User menu */}
          <Button
            color="inherit"
            onClick={handleUserMenuOpen}
            startIcon={<AccountCircle />}
            sx={{ textTransform: 'none' }}
          >
            {user?.username || 'User'}
          </Button>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="textSecondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Ticket View" />
            <Tab label="Gantt Chart View" />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0} noPadding>
          <KanbanBoard 
            tasks={tasks} 
            onRefresh={fetchTasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        </TabPanel>
        <TabPanel value={value} index={1} noPadding>
          <GanttChartView />
        </TabPanel>
      </Container>
    </div>
  );
};

export default Dashboard;
