import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Checkbox, Typography, Grid, Box,
  Accordion, AccordionSummary, AccordionDetails, Chip,
  FormGroup, Alert, CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import api from '../services/api';

const UserForm = ({ open, user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    designation: 'user',
    is_active: true,
    permissions: [],
  });

  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const designations = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'team_lead', label: 'Team Lead' },
    { value: 'developer', label: 'Developer' },
    { value: 'user', label: 'User' },
  ];

  useEffect(() => {
    fetchAvailablePermissions();
    if (user) {
      fetchUserDetails();
    }
  }, [user]);

  const fetchAvailablePermissions = async () => {
    try {
      const response = await api.get('/users/manage/available_permissions/');
      setAvailablePermissions(response.data);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError('Failed to load permissions');
    }
  };

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/manage/${user.id}/`);
      const userData = response.data;
      
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        password: '', // Never populate password
        designation: userData.designation || 'user',
        is_active: userData.is_active !== undefined ? userData.is_active : true,
        permissions: userData.permission_details?.map(p => p.id) || [],
      });
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSelectAllPermissions = (appPermissions) => {
    const allIds = appPermissions.flatMap(group => group.permissions.map(p => p.id));
    const allSelected = allIds.every(id => formData.permissions.includes(id));
    
    if (allSelected) {
      // Deselect all
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(id => !allIds.includes(id))
      }));
    } else {
      // Select all
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...allIds])]
      }));
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!user && !formData.password) {
      errors.password = 'Password is required for new users';
    }
    
    if (formData.password && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const payload = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        designation: formData.designation,
        is_active: formData.is_active,
        permissions: formData.permissions,
      };
      
      // Only include password if it's provided
      if (formData.password) {
        payload.password = formData.password;
      }

      if (user) {
        await api.put(`/users/manage/${user.id}/`, payload);
      } else {
        await api.post('/users/manage/', payload);
      }

      onSubmit();
    } catch (err) {
      console.error('Error saving user:', err);
      if (err.response?.data) {
        // Handle field-specific errors from backend
        if (typeof err.response.data === 'object') {
          setValidationErrors(err.response.data);
        } else {
          setError(err.response.data.detail || 'Failed to save user');
        }
      } else {
        setError('Failed to save user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {user ? 'Edit User' : 'Add New User'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading && !error ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!validationErrors.username}
                  helperText={validationErrors.username}
                  disabled={!!user} // Username cannot be changed
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label={user ? 'New Password (leave blank to keep current)' : 'Password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!user}
                  error={!!validationErrors.password}
                  helperText={validationErrors.password || (user ? 'Only enter if changing password' : 'Min 8 characters')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Designation</InputLabel>
                  <Select
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    label="Designation"
                  >
                    {designations.map((des) => (
                      <MenuItem key={des.value} value={des.value}>
                        {des.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                  }
                  label="Active"
                />
              </Grid>

              {/* Permissions Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Permissions
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Select permissions for tasks, projects, and user management
                </Typography>

                {availablePermissions.map((appGroup, index) => {
                  const appPerms = appGroup.permissions || [];
                  const selectedCount = appPerms.filter(p => formData.permissions.includes(p.id)).length;
                  
                  return (
                    <Accordion key={index}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" gap={1} width="100%">
                          <Typography>
                            {appGroup.model_name || appGroup.model} 
                            ({appGroup.app_label})
                          </Typography>
                          {selectedCount > 0 && (
                            <Chip
                              label={`${selectedCount} selected`}
                              size="small"
                              color="primary"
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box>
                          <Button
                            size="small"
                            onClick={() => handleSelectAllPermissions([appGroup])}
                            sx={{ mb: 1 }}
                          >
                            {selectedCount === appPerms.length ? 'Deselect All' : 'Select All'}
                          </Button>
                          <FormGroup>
                            {appPerms.map((permission) => (
                              <FormControlLabel
                                key={permission.id}
                                control={
                                  <Checkbox
                                    checked={formData.permissions.includes(permission.id)}
                                    onChange={() => handlePermissionToggle(permission.id)}
                                  />
                                }
                                label={`${permission.name} (${permission.codename})`}
                              />
                            ))}
                          </FormGroup>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}

                {formData.permissions.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Total permissions selected: {formData.permissions.length}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (user ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserForm;
