import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import { createTask, updateTask, getTasks, getUsers } from '../services/api';

const TaskForm = ({ open, handleClose, task, parentTaskId = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    start_date: '',
    due_date: '',
    duration: 1,
    progress: 0,
    parent_task_id: '',
    assignee_id: '',
    dependencies: [],
  });
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (task) {
      console.log('=== TASKFORM EDIT MODE ===');
      console.log('Received task:', task);
      
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'To Do',
        priority: task.priority || 'Medium',
        start_date: task.start_date ? new Date(task.start_date).toISOString().split('T')[0] : '',
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        duration: task.duration || 1,
        progress: task.progress !== undefined ? task.progress : 0,
        parent_task_id: task.parent_task || '',
        assignee_id: task.assignee || '',
        dependencies: task.dependencies || [],
      });
      
      console.log('FormData set to:', {
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'To Do',
        priority: task.priority || 'Medium',
        start_date: task.start_date,
        due_date: task.due_date,
        duration: task.duration || 1,
        progress: task.progress !== undefined ? task.progress : 0,
        parent_task_id: task.parent_task || '',
        assignee_id: task.assignee || '',
        dependencies: task.dependencies || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        start_date: '',
        due_date: '',
        duration: 1,
        progress: 0,
        parent_task_id: parentTaskId || '',
        assignee_id: '',
        dependencies: [],
      });
    }
  }, [task, parentTaskId]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await getTasks();
        // Filter out the current task and its subtasks for parent selection
        const availableTasks = data.filter(t => {
          if (task && t.id === task.id) return false;
          if (task && t.parent_task === task.id) return false;
          return true;
        });
        setTasks(availableTasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };
    
    const fetchUsers = async () => {
      try {
        const { data } = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    
    if (open) {
        fetchTasks();
        fetchUsers();
    }
  }, [open, task]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMultiSelectChange = (event) => {
    const { target: { value } } = event;
    setFormData({
        ...formData,
        dependencies: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleSubmit = async () => {
    try {
      // Prepare the data for submission
      const submitData = { ...formData };
      
      // Handle empty parent_task_id - convert empty string to null or remove entirely
      if (submitData.parent_task_id === '' || submitData.parent_task_id === '0' || submitData.parent_task_id === 0) {
        delete submitData.parent_task_id; // Remove the field entirely if empty
      } else if (submitData.parent_task_id) {
        // Convert to integer if not empty
        submitData.parent_task_id = parseInt(submitData.parent_task_id);
      }
      
      // Handle empty assignee_id
      if (submitData.assignee_id === '' || submitData.assignee_id === '0' || submitData.assignee_id === 0) {
        delete submitData.assignee_id;
      } else if (submitData.assignee_id) {
        submitData.assignee_id = parseInt(submitData.assignee_id);
      }
      
      // Convert string numbers to integers
      if (submitData.duration) {
        submitData.duration = parseInt(submitData.duration);
      }
      console.log('=== TASK FORM DEBUG ===');
      console.log('Original formData.progress:', formData.progress, typeof formData.progress);
      console.log('submitData.progress before conversion:', submitData.progress, typeof submitData.progress);
      
      // Handle progress - convert to integer, even if it's 0
      if (submitData.progress !== '' && submitData.progress !== null && submitData.progress !== undefined) {
        const oldProgress = submitData.progress;
        submitData.progress = parseInt(submitData.progress); // Keep as integer percentage (0-100)
        console.log('Progress converted from', oldProgress, 'to', submitData.progress);
      } else {
        submitData.progress = 0; // Default to 0 if not provided
        console.log('Progress set to default 0');
      }
      
      console.log('Final submitData:', submitData);
      
      if (task) {
        await updateTask(task.id, submitData);
      } else {
        await createTask(submitData);
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save task:', error);
      if (error.response && error.response.data) {
        console.error('Server response:', error.response.data);
        alert(`Error saving task: ${JSON.stringify(error.response.data)}`);
      } else {
        alert('Error saving task. Please check the console for details.');
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{task ? 'Edit Task' : 'Add Task'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="title"
          label="Title"
          type="text"
          fullWidth
          variant="standard"
          value={formData.title}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="description"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="standard"
          value={formData.description}
          onChange={handleChange}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <MenuItem value="To Do">To Do</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Done">Done</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>Priority</InputLabel>
          <Select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>Assignee</InputLabel>
          <Select
            name="assignee_id"
            value={formData.assignee_id}
            onChange={handleChange}
          >
            <MenuItem value="">None</MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          name="start_date"
          label="Start Date"
          type="date"
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          value={formData.start_date}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="due_date"
          label="Due Date"
          type="date"
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          value={formData.due_date}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="duration"
          label="Duration (days)"
          type="number"
          fullWidth
          value={formData.duration}
          onChange={handleChange}
          inputProps={{ min: 1 }}
        />
        <TextField
          margin="dense"
          name="progress"
          label="Progress (%)"
          type="number"
          fullWidth
          value={formData.progress}
          onChange={handleChange}
          inputProps={{ min: 0, max: 100 }}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Parent Task (for Subtasks)</InputLabel>
          <Select
            name="parent_task_id"
            value={formData.parent_task_id}
            onChange={handleChange}
          >
            <MenuItem value="">None (Main Task)</MenuItem>
            {tasks.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
            <InputLabel>Dependencies</InputLabel>
            <Select
                name="dependencies"
                multiple
                value={formData.dependencies}
                onChange={handleMultiSelectChange}
                input={<OutlinedInput label="Dependencies" />}
            >
                {tasks.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                        {t.title}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;