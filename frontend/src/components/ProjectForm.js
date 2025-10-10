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
  Autocomplete,
  Chip,
  Alert,
  Typography,
  IconButton,
} from '@mui/material';
import {Close as CloseIcon, FolderOpen as ProjectIcon} from '@mui/icons-material';
import { createProject, updateProject, getUsers } from '../services/api';

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
  const isEdit = !!project;

  useEffect(() => {
    if (open) {
      fetchUsers();
      if (project) {
        setFormData({
          name: project.name || '',
          key: project.key || '',
          description: project.description || '',
          status: project.status || 'Active',
          start_date: project.start_date || '',
          end_date: project.end_date || '',
          member_ids: project.members?.map(m => m.id) || [],
        });
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
  }, [open, project]);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

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

  const handleMembersChange = (event, newValue) => {
    setFormData({ ...formData, member_ids: newValue.map(user => user.id) });
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

  const selectedUsers = users.filter(user => formData.member_ids.includes(user.id));

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#0052cc', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ProjectIcon />
          <Typography variant="h6">
            {isEdit ? 'Edit Project' : 'Create New Project'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

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

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={users}
                value={selectedUsers}
                onChange={handleMembersChange}
                getOptionLabel={(option) => `${option.username} (${option.email})`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Team Members"
                    placeholder="Add team members..."
                    size="small"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.username}
                      {...getTagProps({ index })}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#fafbfc' }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#0052cc',
              '&:hover': { bgcolor: '#0747a6' },
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
