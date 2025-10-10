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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Grid,
} from '@mui/material';
import { 
  ExitToApp, 
  AccountCircle, 
  CalendarToday,
  Timeline,
  CheckCircle,
  Add,
  AttachFile,
} from '@mui/icons-material';
import GanttChart from './GanttChart';
import KanbanBoard from './KanbanBoard';
import TaskForm from './TaskForm';
import TokenExpiryTimer from './TokenExpiryTimer';
import HtmlContent from './HtmlContent';
import DocumentManager from './DocumentManager';
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
                        title: task.title || 'Untitled Task',  // Include both for compatibility
                        start_date: startDate,
                        due_date: task.due_date || '',
                        duration: Math.max(1, task.duration || 1),
                        progress: Math.max(0, task.progress || 0), // Keep as percentage (0-100)
                        parent: task.parent_task || 0,
                        parent_task: task.parent_task || 0,  // Include both for compatibility
                        open: true,
                        status: task.status,
                        priority: task.priority,
                        assignee: task.assignee,
                        assignee_username: task.assignee_username,
                        description: task.description || '',
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
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const response = await getAllTasks();
      const formattedTasks = response.data.map(task => ({
        id: task.id,
        text: task.title || 'Untitled Task',
        start_date: task.start_date || new Date().toISOString().split('T')[0],
        due_date: task.due_date || '',
        duration: Math.max(1, task.duration || 1),
        progress: Math.max(0, task.progress || 0),
        parent: task.parent_task || 0,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        assignee_username: task.assignee_username,
        description: task.description,
        dependencies: task.dependencies || [],
        documents: task.documents || []
      }));
      setTasks({ data: formattedTasks });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setDetailsDialogOpen(true);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskFormOpen(true);
  };

  const handleEditTask = (task) => {
    console.log('=== EDIT TASK DEBUG ===');
    console.log('Original task from Dashboard:', task);
    
    // Convert formatted task back to API format for TaskForm
    const taskForEdit = {
      id: task.id,
      title: task.text || task.title,  // Handle both formats
      description: task.description || '',
      status: task.status || 'To Do',
      priority: task.priority || 'Medium',
      start_date: task.start_date || '',
      due_date: task.due_date || '',
      duration: task.duration || 1,
      progress: task.progress !== undefined ? task.progress : 0,
      parent_task: task.parent || task.parent_task || 0,  // Handle both formats
      assignee: task.assignee || '',  // This is the assignee ID from API
      dependencies: task.dependencies || []
    };
    
    console.log('Converted taskForEdit:', taskForEdit);
    setEditingTask(taskForEdit);
    setTaskFormOpen(true);
    setDetailsDialogOpen(false);
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm(`Delete "${task.text}"?`)) {
      try {
        await deleteTask(task.id);
        setDetailsDialogOpen(false);
        fetchTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleTaskFormClose = () => {
    setTaskFormOpen(false);
    setEditingTask(null);
    fetchTasks();
  };

  const getSubtasksForTask = (taskId) => {
    return tasks.data.filter(task => task.parent === taskId);
  };

  const getDependencyTasks = (dependencyIds) => {
    if (!dependencyIds || !Array.isArray(dependencyIds)) return [];
    return tasks.data.filter(task => dependencyIds.includes(task.id));
  };

  const handleCreateSubtask = (parentTask) => {
    setDetailsDialogOpen(false);
    setEditingTask({
      parent_task: parentTask.id,
      parent_task_title: parentTask.text
    });
    setTaskFormOpen(true);
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Ticket View" />
            <Tab label="Gantt Chart View" />
          </Tabs>
          {value === 0 && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddTask}
              sx={{ my: 1 }}
            >
              Add Task
            </Button>
          )}
        </Box>
        <TabPanel value={value} index={0} noPadding>
          <KanbanBoard 
            tasks={tasks} 
            onRefresh={fetchTasks}
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        </TabPanel>
        <TabPanel value={value} index={1} noPadding>
          <GanttChartView />
        </TabPanel>
      </Container>

      {/* Task Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTask && (
          <>
            <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="h6">{selectedTask.text}</Typography>
                {selectedTask.parent && (
                  <Chip 
                    label="Subtask" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#ffffff', 
                      color: '#1976d2',
                      fontWeight: 600,
                      fontSize: '0.7rem'
                    }} 
                  />
                )}
              </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Start Date" 
                        secondary={new Date(selectedTask.start_date).toLocaleDateString()} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Timeline />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Duration" 
                        secondary={`${selectedTask.duration} day${selectedTask.duration !== 1 ? 's' : ''}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Progress" 
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Box sx={{ width: 100, height: 8, bgcolor: '#e0e0e0', borderRadius: 4 }}>
                              <Box 
                                sx={{ 
                                  width: `${selectedTask.progress}%`, 
                                  height: '100%', 
                                  bgcolor: '#4caf50', 
                                  borderRadius: 4 
                                }} 
                              />
                            </Box>
                            <Typography variant="body2">
                              {selectedTask.progress}%
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  {/* Parent Task Section (if this is a subtask) */}
                  {selectedTask.parent && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Parent Task
                      </Typography>
                      <Chip 
                        label={tasks.data.find(t => t.id === selectedTask.parent)?.text || `Task #${selectedTask.parent}`}
                        onClick={() => {
                          const parentTask = tasks.data.find(t => t.id === selectedTask.parent);
                          if (parentTask) handleTaskClick(parentTask);
                        }}
                        sx={{ 
                          mb: 2, 
                          bgcolor: '#e3f2fd',
                          color: '#1976d2',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: '#bbdefb'
                          }
                        }}
                      />
                    </>
                  )}
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: selectedTask.parent ? 0 : 2 }}>
                    Status
                  </Typography>
                  <Chip 
                    label={selectedTask.status}
                    color={selectedTask.status === 'Done' ? 'success' : selectedTask.status === 'In Progress' ? 'warning' : 'default'}
                    sx={{ mb: 2 }}
                  />
                  
                  {selectedTask.priority && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        Priority
                      </Typography>
                      <Chip 
                        label={selectedTask.priority}
                        sx={{ 
                          mb: 2,
                          bgcolor: selectedTask.priority === 'High' ? '#fee2e2' : selectedTask.priority === 'Medium' ? '#fef3c7' : '#dbeafe',
                          color: selectedTask.priority === 'High' ? '#991b1b' : selectedTask.priority === 'Medium' ? '#92400e' : '#1e40af',
                          fontWeight: 600
                        }}
                      />
                    </>
                  )}
                  
                  {selectedTask.assignee_username && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        Assignee
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {selectedTask.assignee_username}
                      </Typography>
                    </>
                  )}
                  
                  {selectedTask.description && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        Description
                      </Typography>
                      <Box sx={{ 
                        bgcolor: '#f8f9fa', 
                        p: 2, 
                        borderRadius: 1,
                        border: '1px solid #e9ecef' 
                      }}>
                        <HtmlContent content={selectedTask.description} />
                      </Box>
                    </>
                  )}
                </Grid>
                
                {/* Dependencies Section */}
                {selectedTask.dependencies && selectedTask.dependencies.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Timeline />
                      Dependencies ({selectedTask.dependencies.length})
                    </Typography>
                    <List sx={{ bgcolor: '#f8f9fa', borderRadius: 1 }}>
                      {getDependencyTasks(selectedTask.dependencies).map((depTask) => (
                        <ListItem 
                          key={depTask.id}
                          sx={{ 
                            borderBottom: '1px solid #e9ecef',
                            '&:last-child': { borderBottom: 'none' },
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#e9ecef' }
                          }}
                          onClick={() => handleTaskClick(depTask)}
                        >
                          <ListItemText 
                            primary={depTask.text}
                            secondary={
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                <Chip 
                                  label={depTask.status}
                                  size="small"
                                  color={depTask.status === 'Done' ? 'success' : depTask.status === 'In Progress' ? 'warning' : 'default'}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {depTask.progress}% complete
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
                
                {/* Subtasks Section */}
                {!selectedTask.parent && getSubtasksForTask(selectedTask.id).length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle />
                      Subtasks ({getSubtasksForTask(selectedTask.id).length})
                    </Typography>
                    <List sx={{ bgcolor: '#f8f9fa', borderRadius: 1 }}>
                      {getSubtasksForTask(selectedTask.id).map((subtask) => (
                        <ListItem 
                          key={subtask.id}
                          sx={{ 
                            borderBottom: '1px solid #e9ecef',
                            '&:last-child': { borderBottom: 'none' },
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#e9ecef' }
                          }}
                          onClick={() => handleTaskClick(subtask)}
                        >
                          <ListItemText 
                            primary={subtask.text}
                            secondary={
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                <Chip 
                                  label={subtask.status}
                                  size="small"
                                  color={subtask.status === 'Done' ? 'success' : subtask.status === 'In Progress' ? 'warning' : 'default'}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {subtask.progress}% complete
                                </Typography>
                                {subtask.priority && (
                                  <Chip 
                                    label={subtask.priority}
                                    size="small"
                                    sx={{ 
                                      bgcolor: subtask.priority === 'High' ? '#fee2e2' : subtask.priority === 'Medium' ? '#fef3c7' : '#dbeafe',
                                      color: subtask.priority === 'High' ? '#991b1b' : subtask.priority === 'Medium' ? '#92400e' : '#1e40af',
                                    }}
                                  />
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
                
                {/* Documents/Attachments Section */}
                {selectedTask.documents && selectedTask.documents.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachFile />
                      Attachments ({selectedTask.documents.length})
                    </Typography>
                    <DocumentManager
                      taskId={selectedTask.id}
                      documents={selectedTask.documents}
                      onDocumentsChange={fetchTasks}
                    />
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
              {!selectedTask.parent && (
                <Button 
                  onClick={() => handleCreateSubtask(selectedTask)} 
                  variant="outlined"
                  startIcon={<Add />}
                  color="primary"
                >
                  Create Subtask
                </Button>
              )}
              <Button onClick={() => handleEditTask(selectedTask)} variant="contained">
                Edit
              </Button>
              <Button onClick={() => handleDeleteTask(selectedTask)} color="error">
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Task Form Dialog */}
      <TaskForm
        open={taskFormOpen}
        handleClose={handleTaskFormClose}
        task={editingTask}
      />
    </div>
  );
};

export default Dashboard;
