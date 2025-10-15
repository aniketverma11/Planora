import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  Typography,
  IconButton,
  Paper,
  Divider,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
} from '@mui/material';
import {
  Close as CloseIcon, 
  FolderOpen as ProjectIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Person,
  CheckCircle,
  Info,
} from '@mui/icons-material';
import { createProject, updateProject, getUsers, getProject } from '../services/api';

const ProjectForm = ({ open, onClose, project = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    status: 'Active',
    start_date: '',
    end_date: '',
    member_ids: [],
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMembersList, setShowMembersList] = useState(false);
  const isEdit = !!project;

  const fetchProjectDetails = async () => {
    try {
      console.log('ProjectForm: Fetching full project details for:', project.id);
      const response = await getProject(project.id);
      console.log('ProjectForm: Project details:', response.data);
      const projectData = response.data;
      
      setFormData({
        name: projectData.name || '',
        key: projectData.key || '',
        description: projectData.description || '',
        status: projectData.status || 'Active',
        start_date: projectData.start_date || '',
        end_date: projectData.end_date || '',
        member_ids: projectData.members?.map(m => m.id) || [],
      });
      
      console.log('ProjectForm: Set member_ids:', projectData.members?.map(m => m.id));
    } catch (error) {
      console.error('ProjectForm: Error fetching project details:', error);
      // Fallback to project prop data
      setFormData({
        name: project.name || '',
        key: project.key || '',
        description: project.description || '',
        status: project.status || 'Active',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        member_ids: project.members?.map(m => m.id) || [],
      });
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('ProjectForm: Fetching users...');
      const response = await getUsers();
      console.log('ProjectForm: Raw users response:', response);
      console.log('ProjectForm: response.data type:', typeof response.data);
      console.log('ProjectForm: response.data:', response.data);
      
      // Handle different response formats
      let usersArray = [];
      if (Array.isArray(response.data)) {
        usersArray = response.data;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        usersArray = response.data.results;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        usersArray = response.data.data;
      }
      
      console.log('ProjectForm: Setting users array:', usersArray);
      setUsers(usersArray);
    } catch (error) {
      console.error('ProjectForm: Error fetching users:', error);
      setUsers([]);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
      if (project) {
        // Fetch full project details to get members
        fetchProjectDetails();
      } else {
        setFormData({
          name: '',
          key: '',
          description: '',
          status: 'Active',
          start_date: '',
          end_date: '',
          member_ids: [],
        });
      }
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Auto-generate key from name
    if (name === 'name' && !isEdit) {
      const key = value
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 10);
      setFormData(prev => ({ ...prev, key }));
    }
  };

  const handleAddMember = (userId) => {
    if (!formData.member_ids.includes(userId)) {
      setFormData({ ...formData, member_ids: [...formData.member_ids, userId] });
    }
  };

  const handleRemoveMember = (userId) => {
    setFormData({ 
      ...formData, 
      member_ids: formData.member_ids.filter(id => id !== userId) 
    });
  };

  const getFilteredUsers = () => {
    if (!searchTerm) return users;
    return users.filter(user => 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    if (!formData.key.trim()) {
      setError('Project key is required');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateProject(project.id, formData);
      } else {
        await createProject(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      if (error.response?.data?.key) {
        setError('Project key already exists. Please use a different key.');
      } else {
        setError(error.response?.data?.detail || 'Failed to save project. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Safely filter selected users, ensuring users is always an array
  const selectedUsers = Array.isArray(users) 
    ? users.filter(user => formData.member_ids.includes(user.id))
    : [];

  const filteredAvailableUsers = getFilteredUsers().filter(user => !formData.member_ids.includes(user.id));

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          maxHeight: '90vh',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }
      }}
    >
      {/* Header - Matching existing UI style */}
      <DialogTitle sx={{ 
        bgcolor: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
        p: 2.5,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ProjectIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {isEdit ? 'Edit Project' : 'Create New Project'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                {isEdit ? 'Update project details and team members' : 'Set up a new project with your team'}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Basic Details Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
              Basic Details
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Project Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., Task Management System"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Project Key"
                  name="key"
                  value={formData.key}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., TMS"
                  inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }}
                  helperText="Max 10 characters"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  variant="outlined"
                  size="small"
                  placeholder="Describe your project..."
                />
              </Grid>
            </Grid>
          </Box>

          {/* Project Timeline Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
              Project Timeline
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="Planning">Planning</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="On Hold">On Hold</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Team Members Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
              Team Members
              <Chip 
                label={`${formData.member_ids.length} selected`} 
                size="small" 
                sx={{ 
                  ml: 1.5,
                  bgcolor: 'primary.main', 
                  color: 'white',
                  fontWeight: 500,
                  height: 22
                }} 
              />
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add team members who will have access to this project
            </Typography>

            {/* Selected Members */}
            {selectedUsers.length > 0 && (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: '#f8f9fa',
                  borderRadius: 1,
                  border: '1px solid #e9ecef'
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
                  Selected Team Members ({selectedUsers.length})
                </Typography>
                <Stack spacing={1}>
                  {selectedUsers.map((user) => (
                    <Card 
                      key={user.id} 
                      variant="outlined"
                      sx={{ 
                        transition: 'all 0.2s',
                        borderColor: '#e9ecef',
                        '&:hover': { 
                          boxShadow: 1,
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: 36, 
                              height: 36,
                              bgcolor: 'primary.main',
                              fontSize: '0.875rem',
                              fontWeight: 600
                            }}
                          >
                            {user.username?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {user.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveMember(user.id)}
                            sx={{ 
                              color: 'error.main',
                              '&:hover': { bgcolor: 'error.lighter' }
                            }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Add Members Section */}
            <Box>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowMembersList(!showMembersList)}
                sx={{
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: 'primary.dark',
                    bgcolor: 'action.hover',
                    borderWidth: 2,
                  }
                }}
              >
                {showMembersList ? 'Hide Available Members' : 'Add Team Members'}
              </Button>

              {showMembersList && (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    mt: 2, 
                    maxHeight: 300, 
                    overflow: 'auto',
                    borderRadius: 1,
                    border: '1px solid #e9ecef'
                  }}
                >
                  {/* Search Box */}
                  <Box sx={{ 
                    p: 2, 
                    borderBottom: '1px solid #e9ecef', 
                    bgcolor: '#f8f9fa', 
                    position: 'sticky', 
                    top: 0, 
                    zIndex: 1 
                  }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{
                        bgcolor: 'white',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1
                        }
                      }}
                    />
                  </Box>

                  {/* Available Users List */}
                  <List sx={{ p: 1 }}>
                    {filteredAvailableUsers.length > 0 ? (
                      filteredAvailableUsers.map((user) => (
                        <ListItem
                          key={user.id}
                          sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            '&:hover': { bgcolor: '#f8f9fa' },
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', fontSize: '0.875rem' }}>
                              {user.username?.charAt(0).toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {user.username}
                                {user.first_name && user.last_name && (
                                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                    ({user.first_name} {user.last_name})
                                  </Typography>
                                )}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleAddMember(user.id)}
                              sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' },
                                width: 32,
                                height: 32
                              }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))
                    ) : (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Person sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm ? 'No users found matching your search' : 'All users have been added to the team'}
                        </Typography>
                      </Box>
                    )}
                  </List>
                </Paper>
              )}
            </Box>

            {/* Info Box */}
            {formData.member_ids.length === 0 && !showMembersList && (
              <Box 
                sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: '#eff6ff', 
                  borderRadius: 1,
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  gap: 1.5
                }}
              >
                <Info sx={{ color: '#3b82f6', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Click "Add Team Members" to select users who will have access to this project.
                  You can add or remove team members anytime after creating the project.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        {/* Footer - Matching existing UI style */}
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8f9fa' }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            variant="outlined"
            size="medium"
            sx={{ 
              borderColor: '#dee2e6',
              color: 'text.secondary',
              textTransform: 'none',
              '&:hover': { 
                borderColor: '#adb5bd',
                bgcolor: 'action.hover'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? null : <CheckCircle />}
            size="medium"
            sx={{
              px: 3,
              fontWeight: 500,
              textTransform: 'none',
              '&:disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled'
              }
            }}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProjectForm;
