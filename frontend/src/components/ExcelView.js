import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Download as DownloadIcon,
  FileUpload as UploadIcon,
  Description as TemplateIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { saveAs } from 'file-saver';
import { getAllTasks, exportTasksToExcel, downloadSampleExcel, importTasksFromExcel, deleteTask } from '../services/api';

const ExcelView = ({ projectId, onTaskUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getAllTasks(projectId);
      setTasks(response.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleExport = async () => {
    if (!projectId) {
      setError('Please select a project first');
      return;
    }

    try {
      setError('');
      setSuccess('');
      const response = await exportTasksToExcel(projectId);
      
      // Create blob and download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      saveAs(blob, `tasks_project_${projectId}_${timestamp}.xlsx`);
      
      setSuccess('Tasks exported successfully!');
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export tasks');
    }
  };

  const handleDownloadSample = async () => {
    try {
      setError('');
      const response = await downloadSampleExcel();
      
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      saveAs(blob, 'task_import_template.xlsx');
      setSuccess('Sample template downloaded successfully!');
    } catch (err) {
      console.error('Download sample failed:', err);
      setError('Failed to download sample template');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file to import');
      return;
    }

    if (!projectId) {
      setError('Please select a project first');
      return;
    }

    try {
      setImporting(true);
      setError('');
      setImportResult(null);
      
      const response = await importTasksFromExcel(projectId, selectedFile);
      
      setImportResult(response.data);
      setSuccess(`Successfully imported ${response.data.created_count} tasks!`);
      
      // Refresh task list
      await fetchTasks();
      
      if (onTaskUpdate) {
        onTaskUpdate();
      }
      
      // Close dialog after short delay only on success, not on error
      setTimeout(() => {
        setImportDialogOpen(false);
        setSelectedFile(null);
        setImportResult(null);
      }, 3000);
      
    } catch (err) {
      console.error('Import failed:', err);
      setError(err.response?.data?.error || 'Failed to import tasks');
      // Don't auto-close on error - let user read and manually close
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await deleteTask(taskId);
      setSuccess('Task deleted successfully!');
      await fetchTasks();
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete task');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      critical: 'error',
    };
    return colors[priority] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'default',
      in_progress: 'primary',
      completed: 'success',
      on_hold: 'warning',
    };
    return colors[status] || 'default';
  };

  if (!projectId) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Please select a project to view tasks in Excel format
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header with Actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Excel View - Tasks
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchTasks} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="outlined"
            startIcon={<TemplateIcon />}
            onClick={handleDownloadSample}
          >
            Download Sample
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setImportDialogOpen(true)}
          >
            Import Excel
          </Button>
          
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export to Excel
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Table */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
          }}
        >
          <CircularProgress />
        </Box>
      ) : tasks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No tasks found. Import tasks from Excel or create new tasks.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Task ID</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Progress</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Assignee</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} hover>
                  <TableCell>
                    {task.task_number ? (
                      <Chip 
                        label={task.task_number} 
                        size="small" 
                        sx={{ 
                          bgcolor: '#e3f2fd', 
                          color: '#1976d2',
                          fontWeight: 'bold'
                        }} 
                      />
                    ) : (
                      `#${task.id}`
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 300 }}>
                      {task.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.priority}
                      color={getPriorityColor(task.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{task.start_date || '-'}</TableCell>
                  <TableCell>{task.due_date || '-'}</TableCell>
                  <TableCell>{task.duration ? `${task.duration} days` : '-'}</TableCell>
                  <TableCell>{task.progress}%</TableCell>
                  <TableCell>{task.assignee_username || '-'}</TableCell>
                  <TableCell>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => !importing && setImportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import Tasks from Excel</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select an Excel file (.xlsx or .xls) to import tasks. The file should follow the template format.
            </Typography>
            
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mb: 2 }}
            >
              {selectedFile ? selectedFile.name : 'Choose File'}
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
              />
            </Button>

            {importResult && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Successfully imported {importResult.created_count} tasks!
                </Alert>
                
                {importResult.errors && importResult.errors.length > 0 && (
                  <Alert severity="warning">
                    <Typography variant="body2" fontWeight={600}>
                      Errors encountered:
                    </Typography>
                    <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                      {importResult.errors.map((err, idx) => (
                        <li key={idx}>
                          <Typography variant="body2">{err}</Typography>
                        </li>
                      ))}
                    </Box>
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)} disabled={importing}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!selectedFile || importing}
          >
            {importing ? <CircularProgress size={24} /> : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExcelView;
