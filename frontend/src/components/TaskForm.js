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
  OutlinedInput,
  Box,
  Grid,
  Typography,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Slider,
  ToggleButton
} from '@mui/material';
import {
  Close,
  Title as TitleIcon,
  Timeline,
  Flag,
  Person,
  FolderOpen,
  Link as LinkIcon,
  BarChart,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  AttachFile,
} from '@mui/icons-material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Link } from '@tiptap/extension-link';
import './TaskForm.css';
import { createTask, updateTask, getTasks, getUsers, getTaskDocuments } from '../services/api';
import DocumentManager from './DocumentManager';

const TaskForm = ({ open, handleClose, task, parentTaskId = null, projectId = null }) => {
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
  const [documents, setDocuments] = useState([]);

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Add a detailed description...',
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: formData.description,
    onUpdate: ({ editor }) => {
      setFormData({ ...formData, description: editor.getHTML() });
    },
  });

  // Update editor content when task changes
  useEffect(() => {
    if (editor && formData.description !== editor.getHTML()) {
      editor.commands.setContent(formData.description);
    }
  }, [formData.description, editor]);

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
        console.log('🔍 TaskForm: Fetching tasks for projectId:', projectId);
        let data;
        
        if (projectId) {
          // Fetch only tasks from the current project
          const response = await getTasks(projectId);
          data = response.data;
          console.log('✅ TaskForm: Loaded', data.length, 'tasks from project', projectId);
        } else {
          // Fallback: fetch all tasks if no project
          const response = await getTasks();
          data = response.data;
          console.log('⚠️ TaskForm: No projectId, loaded all tasks:', data.length);
        }
        
        // Filter out the current task and its subtasks for parent selection
        const availableTasks = data.filter(t => {
          if (task && t.id === task.id) return false;
          if (task && t.parent_task === task.id) return false;
          return true;
        });
        
        console.log('📋 TaskForm: Available tasks for parent/dependency:', availableTasks.length);
        setTasks(availableTasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };
    
    const fetchUsers = async () => {
      try {
        console.log('TaskForm: Fetching users...');
        const response = await getUsers();
        console.log('TaskForm: Raw users response:', response);
        console.log('TaskForm: response.data type:', typeof response.data);
        console.log('TaskForm: response.data:', response.data);
        
        // Handle different response formats
        let usersArray = [];
        if (Array.isArray(response.data)) {
          usersArray = response.data;
        } else if (response.data?.results && Array.isArray(response.data.results)) {
          usersArray = response.data.results;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          usersArray = response.data.data;
        } else {
          console.error('TaskForm: Unexpected response format:', response.data);
          usersArray = [];
        }
        
        console.log('TaskForm: Setting users array:', usersArray);
        setUsers(usersArray);
      } catch (error) {
        console.error('TaskForm: Failed to fetch users:', error);
        setUsers([]); // Set empty array on error
      }
    };
    
    const fetchDocuments = async () => {
      if (task?.id) {
        try {
          const { data } = await getTaskDocuments(task.id);
          setDocuments(data);
        } catch (error) {
          console.error('Failed to fetch documents:', error);
        }
      }
    };
    
    if (open) {
        fetchTasks();
        fetchUsers();
        fetchDocuments();
    }
  }, [open, task, projectId]);

  const handleDocumentsChange = async () => {
    if (task?.id) {
      try {
        const { data } = await getTaskDocuments(task.id);
        setDocuments(data);
      } catch (error) {
        console.error('Failed to refresh documents:', error);
      }
    }
  };

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
      console.log('🎯 TaskForm: Starting submit with projectId:', projectId);
      // Prepare the data for submission
      const submitData = { ...formData };
      
      // Add project_id if provided
      if (projectId) {
        submitData.project_id = projectId;
        console.log('✅ TaskForm: Added project_id to submitData:', projectId);
      } else {
        console.warn('⚠️ TaskForm: No projectId provided!');
      }
      
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
      console.log('📤 TaskForm: Submitting task with project_id:', submitData.project_id);
      
      if (task) {
        await updateTask(task.id, submitData);
        console.log('✅ TaskForm: Task updated successfully');
      } else {
        const response = await createTask(submitData);
        console.log('✅ TaskForm: Task created successfully:', response.data);
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
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#f8f9fa', 
        borderBottom: '1px solid #e9ecef',
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TitleIcon sx={{ color: '#1976d2' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
            {task ? 'Edit Task' : 'Create New Task'}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#ffffff' }}>
        <Grid container spacing={0} sx={{ minHeight: '500px', justifyContent: 'center'}}>
          {/* Left Column - Main Details */}
          <Grid item xs={12} md={8} sx={{ p: 3, pr: 4, borderRight: { md: '1px solid #e9ecef' }, minWidth: '600px' }}>
            {/* Task Title */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, mb: 1, display: 'block', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                TASK TITLE *
              </Typography>
              <TextField
                autoFocus
                name="title"
                placeholder="Enter task title..."
                fullWidth
                variant="outlined"
                value={formData.title}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fafbfc',
                    fontSize: '0.95rem',
                    '&:hover': {
                      bgcolor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#adb5bd',
                      }
                    },
                    '&.Mui-focused': {
                      bgcolor: '#ffffff',
                    }
                  }
                }}
              />
            </Box>

            {/* Description */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, mb: 1, display: 'block', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                DESCRIPTION
              </Typography>
              <Box sx={{ 
                border: '1px solid #dfe1e6',
                borderRadius: '3px',
                bgcolor: '#fafbfc',
                overflow: 'hidden',
                '&:hover': {
                  bgcolor: '#ffffff',
                  borderColor: '#b3bac5',
                },
                '&:focus-within': {
                  bgcolor: '#ffffff',
                  borderColor: '#4c9aff',
                  boxShadow: '0 0 0 1px #4c9aff',
                }
              }}>
                {/* Editor Toolbar */}
                {editor && (
                  <Box sx={{ 
                    borderBottom: '1px solid #dfe1e6',
                    bgcolor: '#f4f5f7',
                    p: 0.5,
                    px: 1,
                    display: 'flex',
                    gap: 0.25,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}>
                    <ToggleButton
                      value="bold"
                      selected={editor.isActive('bold')}
                      onChange={() => editor.chain().focus().toggleBold().run()}
                      size="small"
                      sx={{ 
                        border: 'none', 
                        borderRadius: '3px',
                        minWidth: '32px',
                        height: '32px',
                        p: 0.5,
                        color: editor.isActive('bold') ? '#0052cc' : '#42526e',
                        bgcolor: editor.isActive('bold') ? '#deebff' : 'transparent',
                        '&:hover': {
                          bgcolor: editor.isActive('bold') ? '#b3d4ff' : '#f4f5f7',
                        }
                      }}
                    >
                      <FormatBold sx={{ fontSize: 18 }} />
                    </ToggleButton>
                    <ToggleButton
                      value="italic"
                      selected={editor.isActive('italic')}
                      onChange={() => editor.chain().focus().toggleItalic().run()}
                      size="small"
                      sx={{ 
                        border: 'none', 
                        borderRadius: '3px',
                        minWidth: '32px',
                        height: '32px',
                        p: 0.5,
                        color: editor.isActive('italic') ? '#0052cc' : '#42526e',
                        bgcolor: editor.isActive('italic') ? '#deebff' : 'transparent',
                        '&:hover': {
                          bgcolor: editor.isActive('italic') ? '#b3d4ff' : '#f4f5f7',
                        }
                      }}
                    >
                      <FormatItalic sx={{ fontSize: 18 }} />
                    </ToggleButton>
                    <ToggleButton
                      value="underline"
                      selected={editor.isActive('strike')}
                      onChange={() => editor.chain().focus().toggleStrike().run()}
                      size="small"
                      sx={{ 
                        border: 'none', 
                        borderRadius: '3px',
                        minWidth: '32px',
                        height: '32px',
                        p: 0.5,
                        color: editor.isActive('strike') ? '#0052cc' : '#42526e',
                        bgcolor: editor.isActive('strike') ? '#deebff' : 'transparent',
                        '&:hover': {
                          bgcolor: editor.isActive('strike') ? '#b3d4ff' : '#f4f5f7',
                        }
                      }}
                    >
                      <FormatUnderlined sx={{ fontSize: 18 }} />
                    </ToggleButton>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: '#dfe1e6' }} />
                    <ToggleButton
                      value="bulletList"
                      selected={editor.isActive('bulletList')}
                      onChange={() => editor.chain().focus().toggleBulletList().run()}
                      size="small"
                      sx={{ 
                        border: 'none', 
                        borderRadius: '3px',
                        minWidth: '32px',
                        height: '32px',
                        p: 0.5,
                        color: editor.isActive('bulletList') ? '#0052cc' : '#42526e',
                        bgcolor: editor.isActive('bulletList') ? '#deebff' : 'transparent',
                        '&:hover': {
                          bgcolor: editor.isActive('bulletList') ? '#b3d4ff' : '#f4f5f7',
                        }
                      }}
                    >
                      <FormatListBulleted sx={{ fontSize: 18 }} />
                    </ToggleButton>
                    <ToggleButton
                      value="orderedList"
                      selected={editor.isActive('orderedList')}
                      onChange={() => editor.chain().focus().toggleOrderedList().run()}
                      size="small"
                      sx={{ 
                        border: 'none', 
                        borderRadius: '3px',
                        minWidth: '32px',
                        height: '32px',
                        p: 0.5,
                        color: editor.isActive('orderedList') ? '#0052cc' : '#42526e',
                        bgcolor: editor.isActive('orderedList') ? '#deebff' : 'transparent',
                        '&:hover': {
                          bgcolor: editor.isActive('orderedList') ? '#b3d4ff' : '#f4f5f7',
                        }
                      }}
                    >
                      <FormatListNumbered sx={{ fontSize: 18 }} />
                    </ToggleButton>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: '#dfe1e6' }} />
                    <ToggleButton
                      value="heading1"
                      selected={editor.isActive('heading', { level: 1 })}
                      onChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                      size="small"
                      sx={{ 
                        border: 'none', 
                        borderRadius: '3px',
                        minWidth: '32px',
                        height: '32px',
                        fontSize: '0.7rem', 
                        fontWeight: 'bold',
                        color: editor.isActive('heading', { level: 1 }) ? '#0052cc' : '#42526e',
                        bgcolor: editor.isActive('heading', { level: 1 }) ? '#deebff' : 'transparent',
                        '&:hover': {
                          bgcolor: editor.isActive('heading', { level: 1 }) ? '#b3d4ff' : '#f4f5f7',
                        }
                      }}
                    >
                      H1
                    </ToggleButton>
                    <ToggleButton
                      value="heading2"
                      selected={editor.isActive('heading', { level: 2 })}
                      onChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      size="small"
                      sx={{ 
                        border: 'none', 
                        borderRadius: '3px',
                        minWidth: '32px',
                        height: '32px',
                        fontSize: '0.7rem', 
                        fontWeight: 'bold',
                        color: editor.isActive('heading', { level: 2 }) ? '#0052cc' : '#42526e',
                        bgcolor: editor.isActive('heading', { level: 2 }) ? '#deebff' : 'transparent',
                        '&:hover': {
                          bgcolor: editor.isActive('heading', { level: 2 }) ? '#b3d4ff' : '#f4f5f7',
                        }
                      }}
                    >
                      H2
                    </ToggleButton>
                    <ToggleButton
                      value="codeBlock"
                      selected={editor.isActive('codeBlock')}
                      onChange={() => editor.chain().focus().toggleCodeBlock().run()}
                      size="small"
                      sx={{ 
                        border: 'none', 
                        borderRadius: '3px',
                        minWidth: '32px',
                        height: '32px',
                        p: 0.5,
                        color: editor.isActive('codeBlock') ? '#0052cc' : '#42526e',
                        bgcolor: editor.isActive('codeBlock') ? '#deebff' : 'transparent',
                        '&:hover': {
                          bgcolor: editor.isActive('codeBlock') ? '#b3d4ff' : '#f4f5f7',
                        }
                      }}
                    >
                      <Code sx={{ fontSize: 18 }} />
                    </ToggleButton>
                  </Box>
                )}
                
                {/* Editor Content */}
                <Box sx={{
                  '& .ProseMirror': {
                    minHeight: '150px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    padding: '10px 14px',
                    outline: 'none',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: '#172b4d',
                    '& p': { margin: '0.5em 0' },
                    '& h1': { fontSize: '2em', margin: '0.5em 0', fontWeight: 600 },
                    '& h2': { fontSize: '1.5em', margin: '0.5em 0', fontWeight: 600 },
                    '& h3': { fontSize: '1.17em', margin: '0.5em 0', fontWeight: 600 },
                    '& ul, & ol': { paddingLeft: '1.5em', margin: '0.5em 0' },
                    '& a': { color: '#0052cc', textDecoration: 'underline' },
                    '& code': { 
                      bgcolor: '#f4f5f7', 
                      padding: '2px 6px', 
                      borderRadius: '3px',
                      fontSize: '0.9em',
                      fontFamily: 'monospace'
                    },
                    '& pre': {
                      bgcolor: '#f4f5f7',
                      padding: '12px',
                      borderRadius: '3px',
                      overflow: 'auto',
                      '& code': {
                        bgcolor: 'transparent',
                        padding: 0
                      }
                    },
                    '&.ProseMirror-focused': {
                      outline: 'none',
                    },
                  },
                  '& .ProseMirror p.is-editor-empty:first-child::before': {
                    color: '#8993a4',
                    content: 'attr(data-placeholder)',
                    float: 'left',
                    height: 0,
                    pointerEvents: 'none',
                  }
                }}>
                  <EditorContent editor={editor} />
                </Box>
              </Box>
            </Box>

            {/* Dates Section */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, mb: 1, display: 'block', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  START DATE
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    sx: {
                      bgcolor: '#fafbfc',
                      fontSize: '0.95rem',
                      '& input': {
                        padding: '8px 12px',
                      },
                      '&:hover': {
                        bgcolor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#b3bac5',
                        }
                      },
                      '&.Mui-focused': {
                        bgcolor: '#ffffff',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dfe1e6',
                        borderRadius: '3px',
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, mb: 1, display: 'block', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  DUE DATE
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    sx: {
                      bgcolor: '#fafbfc',
                      fontSize: '0.95rem',
                      '& input': {
                        padding: '8px 12px',
                      },
                      '&:hover': {
                        bgcolor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#b3bac5',
                        }
                      },
                      '&.Mui-focused': {
                        bgcolor: '#ffffff',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dfe1e6',
                        borderRadius: '3px',
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* Progress */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  PROGRESS
                </Typography>
                <Chip 
                  label={`${formData.progress}%`} 
                  size="small"
                  sx={{ 
                    bgcolor: formData.progress === 100 ? '#d1fae5' : formData.progress > 0 ? '#fef3c7' : '#e5e7eb',
                    color: formData.progress === 100 ? '#065f46' : formData.progress > 0 ? '#92400e' : '#6c757d',
                    fontWeight: 600,
                    minWidth: '60px',
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
              <Slider
                name="progress"
                value={formData.progress}
                onChange={(e, newValue) => setFormData({ ...formData, progress: newValue })}
                min={0}
                max={100}
                step={5}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' },
                ]}
                sx={{
                  color: '#0052cc',
                  height: 6,
                  '& .MuiSlider-thumb': {
                    width: 16,
                    height: 16,
                    bgcolor: formData.progress === 100 ? '#10b981' : '#0052cc',
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(0, 82, 204, 0.16)',
                    },
                  },
                  '& .MuiSlider-track': {
                    bgcolor: formData.progress === 100 ? '#10b981' : '#0052cc',
                  },
                  '& .MuiSlider-rail': {
                    bgcolor: '#dfe1e6',
                  },
                  '& .MuiSlider-mark': {
                    bgcolor: '#dfe1e6',
                  },
                  '& .MuiSlider-markLabel': {
                    fontSize: '0.65rem',
                    color: '#6c757d',
                  }
                }}
              />
            </Box>
          </Grid>

          {/* Right Column - Metadata */}
          <Grid item xs={12} md={4} sx={{ p: 3, bgcolor: '#fafbfc', borderLeft: '1px solid #dfe1e6' }}>
            <Box>
              {/* Status */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  <BarChart sx={{ fontSize: 14 }} />
                  STATUS
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    sx={{
                      bgcolor: '#ffffff',
                      fontSize: '0.95rem',
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        padding: '8px 12px',
                      },
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#b3bac5',
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dfe1e6',
                        borderRadius: '3px',
                      }
                    }}
                  >
                    <MenuItem value="To Do">
                      <Chip label="To Do" size="small" sx={{ bgcolor: '#e5e7eb', color: '#374151', fontWeight: 500 }} />
                    </MenuItem>
                    <MenuItem value="In Progress">
                      <Chip label="In Progress" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 500 }} />
                    </MenuItem>
                    <MenuItem value="Done">
                      <Chip label="Done" size="small" sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 500 }} />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Priority */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  <Flag sx={{ fontSize: 14 }} />
                  PRIORITY
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    sx={{
                      bgcolor: '#ffffff',
                      fontSize: '0.95rem',
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        padding: '8px 12px',
                      },
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#b3bac5',
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dfe1e6',
                        borderRadius: '3px',
                      }
                    }}
                  >
                    <MenuItem value="Low">
                      <Chip label="Low" size="small" sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 500 }} />
                    </MenuItem>
                    <MenuItem value="Medium">
                      <Chip label="Medium" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 500 }} />
                    </MenuItem>
                    <MenuItem value="High">
                      <Chip label="High" size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 500 }} />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Assignee */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  <Person sx={{ fontSize: 14 }} />
                  ASSIGNEE
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="assignee_id"
                    value={formData.assignee_id}
                    onChange={handleChange}
                    sx={{ 
                      bgcolor: '#ffffff',
                      fontSize: '0.95rem',
                      '& .MuiSelect-select': {
                        padding: '8px 12px',
                      },
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#b3bac5',
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dfe1e6',
                        borderRadius: '3px',
                      }
                    }}
                    renderValue={(selected) => {
                      if (!selected) return <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>Unassigned</Typography>;
                      const user = Array.isArray(users) ? users.find(u => u.id === selected) : null;
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem', bgcolor: '#0052cc' }}>
                            {user?.username?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>{user?.username}</Typography>
                        </Box>
                      );
                    }}
                  >
                    <MenuItem value="">
                      <Typography variant="body2" color="text.secondary">Unassigned</Typography>
                    </MenuItem>
                    {Array.isArray(users) && users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#1976d2' }}>
                            {user.username.charAt(0).toUpperCase()}
                          </Avatar>
                          {user.username}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2.5, borderColor: '#dfe1e6' }} />

              {/* Duration */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  <Timeline sx={{ fontSize: 14 }} />
                  DURATION (DAYS)
                </Typography>
                <TextField
                  name="duration"
                  type="number"
                  fullWidth
                  size="small"
                  value={formData.duration}
                  onChange={handleChange}
                  inputProps={{ min: 1 }}
                  sx={{ 
                    bgcolor: '#ffffff',
                    fontSize: '0.95rem',
                    '& input': {
                      padding: '8px 12px',
                    },
                    '& .MuiOutlinedInput-root:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#b3bac5',
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#dfe1e6',
                      borderRadius: '3px',
                    }
                  }}
                />
              </Box>

              {/* Parent Task */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  <FolderOpen sx={{ fontSize: 14 }} />
                  PARENT TASK
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="parent_task_id"
                    value={formData.parent_task_id}
                    onChange={handleChange}
                    sx={{ 
                      bgcolor: '#ffffff',
                      fontSize: '0.95rem',
                      '& .MuiSelect-select': {
                        padding: '8px 12px',
                      },
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#b3bac5',
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dfe1e6',
                        borderRadius: '3px',
                      }
                    }}
                  >
                    <MenuItem value="">
                      <Typography variant="body2" color="text.secondary">None (Main Task)</Typography>
                    </MenuItem>
                    {tasks.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Dependencies */}
              <Box>
                <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  <LinkIcon sx={{ fontSize: 14 }} />
                  DEPENDENCIES
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="dependencies"
                    multiple
                    value={formData.dependencies}
                    onChange={handleMultiSelectChange}
                    input={<OutlinedInput />}
                    sx={{ 
                      bgcolor: '#ffffff',
                      fontSize: '0.95rem',
                      '& .MuiSelect-select': {
                        padding: '8px 12px',
                      },
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#b3bac5',
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dfe1e6',
                        borderRadius: '3px',
                      }
                    }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>None</Typography>
                        ) : (
                          selected.map((value) => {
                            const task = tasks.find(t => t.id === value);
                            return (
                              <Chip 
                                key={value} 
                                label={task?.title || value} 
                                size="small"
                                sx={{ bgcolor: '#e5e7eb', fontSize: '0.7rem', height: '20px' }}
                              />
                            );
                          })
                        )}
                      </Box>
                    )}
                  >
                    {tasks.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Documents Section - Only show for existing tasks */}
              {task?.id && (
                <>
                  <Divider sx={{ my: 2.5, borderColor: '#dfe1e6' }} />
                  
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                      <AttachFile sx={{ fontSize: 14 }} />
                      ATTACHMENTS
                    </Typography>
                    <DocumentManager
                      taskId={task.id}
                      documents={documents}
                      onDocumentsChange={handleDocumentsChange}
                    />
                  </Box>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ 
        p: 2.5, 
        bgcolor: '#f8f9fa', 
        borderTop: '1px solid #e9ecef',
        gap: 1
      }}>
        <Button 
          onClick={handleClose}
          sx={{ 
            textTransform: 'none',
            color: '#6c757d',
            '&:hover': {
              bgcolor: '#e9ecef'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          sx={{
            textTransform: 'none',
            bgcolor: '#1976d2',
            px: 3,
            '&:hover': {
              bgcolor: '#1565c0'
            }
          }}
        >
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;