import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Typography,
  Box,
  Collapse,
  Chip,
} from '@mui/material';
import { Edit, Delete, ExpandMore, ExpandLess } from '@mui/icons-material';
import { getAllTasks, deleteTask } from '../services/api';
import TaskForm from './TaskForm';

const TaskList = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await getAllTasks();
      setAllTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleOpen = (task = null) => {
    setSelectedTask(task);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTask(null);
    fetchTasks();
  };

  const toggleExpanded = (taskId) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'success';
      case 'In Progress': return 'warning';
      case 'To Do': return 'default';
      default: return 'default';
    }
  };

  // Separate main tasks and subtasks
  const mainTasks = allTasks.filter(task => !task.parent_task);
  const getSubtasksForTask = (taskId) => {
    return allTasks.filter(task => task.parent_task === taskId);
  };

  const renderTask = (task, isSubtask = false) => (
    <ListItem
      key={task.id}
      sx={{ 
        pl: isSubtask ? 4 : 2,
        bgcolor: isSubtask ? 'action.hover' : 'inherit'
      }}
      secondaryAction={
        <>
          <Chip 
            label={task.status} 
            color={getStatusColor(task.status)}
            size="small"
            sx={{ mr: 1 }}
          />
          <IconButton edge="end" aria-label="edit" onClick={() => handleOpen(task)}>
            <Edit />
          </IconButton>
          <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(task.id)}>
            <Delete />
          </IconButton>
        </>
      }
    >
      <ListItemText 
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isSubtask && <span style={{ color: '#666' }}>└─</span>}
            <Typography variant={isSubtask ? 'body2' : 'body1'}>
              {task.title}
            </Typography>
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary">
              {task.description}
            </Typography>
            {task.start_date && (
              <Typography variant="caption" color="text.secondary">
                {new Date(task.start_date).toLocaleDateString()} - {task.duration} day{task.duration !== 1 ? 's' : ''} - {task.progress}% complete
              </Typography>
            )}
          </Box>
        }
      />
    </ListItem>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Task List</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Task
        </Button>
      </Box>
      <List>
        {mainTasks.map((task) => {
          const subtasks = getSubtasksForTask(task.id);
          const isExpanded = expandedTasks.has(task.id);
          
          return (
            <Box key={task.id}>
              <ListItem
                sx={{ pl: 2 }}
                secondaryAction={
                  <>
                    {subtasks.length > 0 && (
                      <IconButton 
                        edge="end" 
                        aria-label="expand" 
                        onClick={() => toggleExpanded(task.id)}
                        sx={{ mr: 1 }}
                      >
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    )}
                    <Chip 
                      label={task.status} 
                      color={getStatusColor(task.status)}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpen(task)}>
                      <Edit />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(task.id)}>
                      <Delete />
                    </IconButton>
                  </>
                }
              >
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {task.title}
                      </Typography>
                      {subtasks.length > 0 && (
                        <Chip label={`${subtasks.length} subtask${subtasks.length !== 1 ? 's' : ''}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                      </Typography>
                      {task.start_date && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(task.start_date).toLocaleDateString()} - {task.duration} day{task.duration !== 1 ? 's' : ''} - {task.progress}% complete
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              
              <Collapse in={isExpanded}>
                <List component="div" disablePadding>
                  {subtasks.map((subtask) => renderTask(subtask, true))}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>
      <TaskForm open={open} handleClose={handleClose} task={selectedTask} />
    </Box>
  );
};

export default TaskList;