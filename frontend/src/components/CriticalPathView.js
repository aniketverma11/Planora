import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { getCriticalPath, calculateCriticalPath, getFloatAnalysis } from '../services/api';

const CriticalPathView = ({ projectId }) => {
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [criticalPathData, setCriticalPathData] = useState(null);
  const [floatAnalysis, setFloatAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [expandedPaths, setExpandedPaths] = useState({});

  // Fetch critical path data
  const fetchCriticalPath = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    try {
      const [cpResponse, floatResponse] = await Promise.all([
        getCriticalPath(projectId),
        getFloatAnalysis(projectId)
      ]);
      
      console.log('🎯 Critical Path Data:', cpResponse.data);
      console.log('📊 Float Analysis:', floatResponse.data);
      console.log('📈 Float Summary:', floatResponse.data?.summary);
      
      setCriticalPathData(cpResponse.data);
      setFloatAnalysis(floatResponse.data);
    } catch (err) {
      console.error('❌ Error fetching critical path:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to load critical path analysis');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Calculate and save critical path
  const handleCalculate = useCallback(async () => {
    if (!projectId) return;
    
    setCalculating(true);
    setError(null);
    try {
      const response = await calculateCriticalPath(projectId);
      console.log('Calculation result:', response.data);
      
      // Refresh data after calculation
      await fetchCriticalPath();
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error calculating critical path:', err);
      setError(err.response?.data?.error || 'Failed to calculate critical path');
    } finally {
      setCalculating(false);
    }
  }, [projectId, fetchCriticalPath]);

  // Load data on mount and when projectId changes
  useEffect(() => {
    fetchCriticalPath();
  }, [fetchCriticalPath]);

  // Toggle path expansion
  const togglePathExpansion = useCallback((pathIndex) => {
    setExpandedPaths(prev => ({
      ...prev,
      [pathIndex]: !prev[pathIndex]
    }));
  }, []);

  // Get risk level color
  const getRiskLevelColor = (riskLevel) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return colors[riskLevel] || 'default';
  };

  // Get risk level icon
  const getRiskLevelIcon = (riskLevel) => {
    if (riskLevel === 'low') return <CheckCircleIcon />;
    if (riskLevel === 'medium') return <InfoIcon />;
    return <WarningIcon />;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleCalculate} disabled={calculating}>
          {calculating ? 'Calculating...' : 'Recalculate Critical Path'}
        </Button>
      </Box>
    );
  }

  // No data state
  if (!criticalPathData || !criticalPathData.critical_tasks) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          No critical path data available. Click the button below to calculate.
        </Alert>
        <Button 
          variant="contained" 
          onClick={handleCalculate} 
          disabled={calculating}
          startIcon={calculating ? <CircularProgress size={20} /> : <RefreshIcon />}
        >
          {calculating ? 'Calculating...' : 'Calculate Critical Path'}
        </Button>
      </Box>
    );
  }

  const { 
    critical_tasks = [], 
    critical_paths = [], 
    project_duration = 0,
    earliest_completion,
    total_tasks = 0,
    critical_tasks_count = 0,
    risk_level = 'unknown'
  } = criticalPathData;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <TimelineIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4">Critical Path Analysis</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={calculating ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={handleCalculate}
          disabled={calculating}
        >
          {calculating ? 'Recalculating...' : 'Recalculate'}
        </Button>
      </Box>

      {/* Project Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Project Duration
              </Typography>
              <Typography variant="h4">
                {project_duration} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Critical Tasks
              </Typography>
              <Typography variant="h4">
                {critical_tasks_count} / {total_tasks}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {total_tasks > 0 ? Math.round((critical_tasks_count / total_tasks) * 100) : 0}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Earliest Completion
              </Typography>
              <Typography variant="h6">
                {formatDate(earliest_completion)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography color="textSecondary">
                  Risk Level
                </Typography>
                {getRiskLevelIcon(risk_level)}
              </Box>
              <Chip 
                label={risk_level.toUpperCase()} 
                color={getRiskLevelColor(risk_level)}
                size="large"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Critical Paths Section */}
      {critical_paths.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Critical Paths ({critical_paths.length})
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            These are the sequences of tasks that determine the project duration. Any delay in these tasks will delay the entire project.
          </Typography>
          
          {critical_paths.map((path, pathIndex) => (
            <Box key={pathIndex} sx={{ mb: 2 }}>
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="space-between"
                sx={{ 
                  p: 2, 
                  bgcolor: 'error.light', 
                  color: 'error.contrastText',
                  borderRadius: 1,
                  cursor: 'pointer'
                }}
                onClick={() => togglePathExpansion(pathIndex)}
              >
                <Typography variant="h6">
                  Path {pathIndex + 1} - {path.length} tasks
                </Typography>
                <IconButton size="small" sx={{ color: 'inherit' }}>
                  {expandedPaths[pathIndex] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              <Collapse in={expandedPaths[pathIndex]}>
                <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                  {path.map((task, taskIndex) => (
                    <Box key={task.id}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Chip 
                          label={`Day ${task.early_start} - ${task.early_finish}`}
                          size="small"
                          color="error"
                        />
                        {task.task_number && (
                          <Chip 
                            label={task.task_number} 
                            size="small" 
                            sx={{ 
                              bgcolor: '#e3f2fd', 
                              color: '#1976d2',
                              fontWeight: 'bold'
                            }} 
                          />
                        )}
                        <Typography variant="body1">
                          <strong>{task.title}</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          ({task.duration} days)
                        </Typography>
                      </Box>
                      {taskIndex < path.length - 1 && (
                        <Box sx={{ ml: 2, my: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            ↓
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          ))}
        </Paper>
      )}

      {/* Critical Tasks Table */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 3, pb: 0 }}>
          <Typography variant="h5" gutterBottom>
            Critical Tasks Details
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Tasks with zero float - any delay will impact project completion.
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Task</strong></TableCell>
                <TableCell><strong>Duration</strong></TableCell>
                <TableCell><strong>Early Start</strong></TableCell>
                <TableCell><strong>Early Finish</strong></TableCell>
                <TableCell><strong>Late Start</strong></TableCell>
                <TableCell><strong>Late Finish</strong></TableCell>
                <TableCell><strong>Float</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Progress</strong></TableCell>
                <TableCell><strong>Assignee</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {critical_tasks.map((task) => (
                <TableRow 
                  key={task.id}
                  sx={{ bgcolor: 'error.light', '&:hover': { bgcolor: 'error.main', color: 'white' } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {task.task_number && (
                        <Chip 
                          label={task.task_number} 
                          size="small" 
                          sx={{ 
                            bgcolor: '#e3f2fd', 
                            color: '#1976d2',
                            fontWeight: 'bold',
                            width: 'fit-content'
                          }} 
                        />
                      )}
                      <Tooltip title={task.description || 'No description'}>
                        <Typography variant="body2">{task.title}</Typography>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>{task.duration} days</TableCell>
                  <TableCell>Day {task.early_start}</TableCell>
                  <TableCell>Day {task.early_finish}</TableCell>
                  <TableCell>Day {task.late_start}</TableCell>
                  <TableCell>Day {task.late_finish}</TableCell>
                  <TableCell>
                    <Chip label={`${task.total_float} days`} size="small" color="error" />
                  </TableCell>
                  <TableCell>
                    <Chip label={task.status} size="small" />
                  </TableCell>
                  <TableCell>{task.progress}%</TableCell>
                  <TableCell>{task.assignee_username || 'Unassigned'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Float Analysis Section */}
      {floatAnalysis && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Float Analysis
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Tasks categorized by their scheduling flexibility (float/slack).
          </Typography>

          <Grid container spacing={3}>
            {/* Critical Tasks (0 float) */}
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'error.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Critical (0 days float)
                  </Typography>
                  <Typography variant="h4">
                    {floatAnalysis.summary?.critical || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    No scheduling flexibility
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Near-Critical Tasks (1-2 days) */}
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'warning.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Near-Critical (1-2 days)
                  </Typography>
                  <Typography variant="h4">
                    {floatAnalysis.summary?.near_critical || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Limited flexibility
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Normal Tasks (>2 days) */}
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Normal (&gt;2 days)
                  </Typography>
                  <Typography variant="h4">
                    {floatAnalysis.summary?.normal || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Good scheduling flexibility
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Near-Critical Tasks Table */}
          {floatAnalysis.near_critical && floatAnalysis.near_critical.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom color="warning.main">
                ⚠️ Near-Critical Tasks (Monitor Closely)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Task</strong></TableCell>
                      <TableCell><strong>Float</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Progress</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {floatAnalysis.near_critical.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {task.task_number && (
                              <Chip 
                                label={task.task_number} 
                                size="small" 
                                sx={{ 
                                  bgcolor: '#e3f2fd', 
                                  color: '#1976d2',
                                  fontWeight: 'bold',
                                  width: 'fit-content'
                                }} 
                              />
                            )}
                            <Typography variant="body2">{task.title}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={`${task.total_float} days`} size="small" color="warning" />
                        </TableCell>
                        <TableCell>{task.status}</TableCell>
                        <TableCell>{task.progress}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default CriticalPathView;
