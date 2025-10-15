import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, TextField, InputAdornment,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Select,
  MenuItem, FormControl, InputLabel, Alert, CircularProgress, Box
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Download as DownloadIcon,
  FileUpload as UploadIcon, Description as TemplateIcon,
  Email as EmailIcon, ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { importUsersFromExcel, exportUsersToExcel, downloadUserSampleExcel } from '../services/api';
import api from '../services/api';
import UserForm from './UserForm';
import { saveAs } from 'file-saver';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [success, setSuccess] = useState('');

  const designations = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'team_lead', label: 'Team Lead' },
    { value: 'developer', label: 'Developer' },
    { value: 'user', label: 'User' },
  ];

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/users/current/');
      setCurrentUser(response.data);
      
      // Check if user is admin
      if (response.data.designation !== 'admin') {
        setError('Access denied. Only admin users can access user management.');
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      setError('Failed to verify user permissions');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterDesignation) params.designation = filterDesignation;

      console.log('Fetching users with params:', params);
      const response = await api.get('/users/manage/', { params });
      console.log('Full API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));
      
      // Handle both array and object responses
      let userData;
      if (Array.isArray(response.data)) {
        userData = response.data;
      } else if (response.data && response.data.results) {
        userData = response.data.results;
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object but not an array, wrap it
        userData = [response.data];
      } else {
        userData = [];
      }
      
      console.log('Setting users to:', userData);
      console.log('User count:', userData.length);
      setUsers(userData);
    } catch (err) {
      console.error('Error fetching users:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentUser?.designation === 'admin') {
        fetchUsers();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterDesignation]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setOpenForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenForm(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedUser(null);
  };

  const handleFormSubmit = () => {
    fetchUsers();
    handleFormClose();
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/users/manage/${userToDelete.id}/`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const getDesignationChipColor = (designation) => {
    const colors = {
      admin: 'error',
      manager: 'primary',
      team_lead: 'secondary',
      developer: 'info',
      user: 'default',
    };
    return colors[designation] || 'default';
  };

  const handleExport = async () => {
    try {
      setError('');
      setSuccess('');
      const response = await exportUsersToExcel();
      
      // Create blob and download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      const filename = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, filename);
      setSuccess('Users exported successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export users');
    }
  };

  const handleDownloadSample = async () => {
    try {
      setError('');
      const response = await downloadUserSampleExcel();
      
      // Create blob and download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      const filename = `sample_user_import_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, filename);
    } catch (err) {
      console.error('Download sample failed:', err);
      setError('Failed to download sample file');
    }
  };

  const handleResendVerificationEmail = async (user) => {
    try {
      setError('');
      setSuccess('');
      
      const response = await api.post(`/users/manage/${user.id}/resend-verification/`);
      
      setSuccess(response.data.message || `Verification email sent to ${user.email}`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Resend verification failed:', err);
      const errorMsg = err.response?.data?.error || 'Failed to resend verification email';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file to import');
      return;
    }

    try {
      setImporting(true);
      setError('');
      setImportResult(null);
      
      const response = await importUsersFromExcel(selectedFile);
      setImportResult(response.data);
      setSuccess(`Successfully imported ${response.data.created_count} users!`);
      
      // Refresh user list
      await fetchUsers();
      
      // Close dialog after short delay only on success
      setTimeout(() => {
        setImportDialogOpen(false);
        setSelectedFile(null);
        setImportResult(null);
      }, 3000);
      
    } catch (err) {
      console.error('Import failed:', err);
      setError(err.response?.data?.error || 'Failed to import users');
      // Don't auto-close on error - let user read and manually close
    } finally {
      setImporting(false);
    }
  };

  if (currentUser && currentUser.designation !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Access denied. Only admin users can access user management.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate('/dashboard')}
          sx={{ mr: 2 }}
          color="primary"
          title="Back to Dashboard"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          User Management
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filters and Actions */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: '250px' }}
          />

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Designation</InputLabel>
            <Select
              value={filterDesignation}
              onChange={(e) => setFilterDesignation(e.target.value)}
              label="Designation"
            >
              <MenuItem value="">All</MenuItem>
              {designations.map((d) => (
                <MenuItem key={d.value} value={d.value}>
                  {d.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
          >
            Add User
          </Button>
        </Box>

        {/* Excel Import/Export Actions */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setImportDialogOpen(true)}
            color="primary"
          >
            Import Users
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            color="success"
          >
            Export Users
          </Button>

          <Button
            variant="outlined"
            startIcon={<TemplateIcon />}
            onClick={handleDownloadSample}
            color="info"
          >
            Download Sample
          </Button>
        </Box>
      </Paper>

      {/* Users Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Email Verified</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{`${user.first_name || ''} ${user.last_name || ''}`.trim() || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={designations.find(d => d.value === user.designation)?.label || user.designation}
                        color={getDesignationChipColor(user.designation)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? 'Active' : 'Inactive'}
                        color={user.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.email_verified ? 'Verified' : 'Pending'}
                        color={user.email_verified ? 'success' : 'warning'}
                        size="small"
                        icon={user.email_verified ? <EmailIcon /> : null}
                      />
                    </TableCell>
                    <TableCell>{user.permission_count || 0}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditUser(user)}
                        size="small"
                        title="Edit User"
                      >
                        <EditIcon />
                      </IconButton>
                      {!user.email_verified && (
                        <IconButton
                          color="secondary"
                          onClick={() => handleResendVerificationEmail(user)}
                          size="small"
                          title="Resend Verification Email"
                        >
                          <EmailIcon />
                        </IconButton>
                      )}
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(user)}
                        size="small"
                        disabled={user.id === currentUser?.id}
                        title="Delete User"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* User Form Dialog */}
      {openForm && (
        <UserForm
          open={openForm}
          user={selectedUser}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete user "{userToDelete?.username}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Users Dialog */}
      <Dialog 
        open={importDialogOpen} 
        onClose={() => !importing && setImportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import Users from Excel</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {importResult && importResult.errors && importResult.errors.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Import completed with warnings:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                {importResult.errors.map((err, idx) => (
                  <li key={idx}><Typography variant="caption">{err}</Typography></li>
                ))}
              </Box>
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload an Excel file with user data. The file should contain columns:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 1 }}>
              <li><Typography variant="body2"><strong>Username</strong> (required)</Typography></li>
              <li><Typography variant="body2"><strong>First Name</strong> (required)</Typography></li>
              <li><Typography variant="body2"><strong>Last Name</strong> (required)</Typography></li>
              <li><Typography variant="body2"><strong>Email</strong> (required)</Typography></li>
              <li><Typography variant="body2"><strong>Password</strong> (optional - if empty, user receives verification email to set password)</Typography></li>
            </Box>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Recommended:</strong> Leave password blank. Users will receive a verification email with a link to set their own password securely.
              </Typography>
            </Alert>
          </Box>

          <Button
            variant="outlined"
            component="label"
            fullWidth
            startIcon={<UploadIcon />}
            sx={{ mb: 2 }}
          >
            {selectedFile ? selectedFile.name : 'Choose Excel File'}
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
            />
          </Button>

          {importResult && (
            <Alert severity="info">
              <Typography variant="body2">
                Created: {importResult.created_count} users<br />
                Skipped: {importResult.skipped_count} users
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setImportDialogOpen(false);
              setSelectedFile(null);
              setImportResult(null);
              setError('');
            }} 
            disabled={importing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!selectedFile || importing}
            startIcon={importing ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {importing ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
