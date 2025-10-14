import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  LinearProgress,
  IconButton,
  Divider,
} from '@mui/material';
import {
  FolderOpen as ProjectIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useProject } from '../contexts/ProjectContext';
import ProjectForm from './ProjectForm';

const ProjectSelector = ({ open, onClose }) => {
  const { projects, loading, fetchProjects, selectProject, selectedProject } = useProject();
  const [showProjectForm, setShowProjectForm] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open, fetchProjects]);

  const handleSelectProject = (project) => {
    selectProject(project);
    onClose();
  };

  const handleCreateNew = () => {
    setShowProjectForm(true);
  };

  const handleCloseProjectForm = () => {
    setShowProjectForm(false);
    fetchProjects();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Planning':
        return 'info';
      case 'On Hold':
        return 'warning';
      case 'Completed':
        return 'default';
      case 'Archived':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '60vh',
            maxHeight: '80vh',
          },
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#0052cc', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ProjectIcon />
            <Typography variant="h6">Select Project</Typography>
          </Box>
          <Button
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            sx={{ 
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'white',
              }
            }}
            variant="outlined"
            size="small"
          >
            New Project
          </Button>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : projects.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
              <ProjectIcon sx={{ fontSize: 80, color: '#dfe1e6', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Projects Found
              </Typography>
              <Typography color="text.secondary" paragraph>
                Create your first project to get started with task management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateNew}
                sx={{ mt: 2 }}
              >
                Create Project
              </Button>
            </Box>
          ) : (
            <List sx={{ pt: 0 }}>
              {projects.map((project) => (
                <React.Fragment key={project.id}>
                  <ListItem
                    disablePadding
                    secondaryAction={
                      selectedProject?.id === project.id && (
                        <IconButton edge="end">
                          <CheckIcon color="success" />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemButton
                      onClick={() => handleSelectProject(project)}
                      selected={selectedProject?.id === project.id}
                      sx={{
                        py: 2,
                        '&.Mui-selected': {
                          bgcolor: '#e3f2fd',
                          '&:hover': {
                            bgcolor: '#bbdefb',
                          },
                        },
                      }}
                    >
                      <ListItemIcon>
                        <ProjectIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Chip 
                              label={project.key} 
                              size="small" 
                              sx={{ 
                                bgcolor: '#deebff',
                                color: '#0052cc',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              {project.name}
                            </Typography>
                            <Chip
                              label={project.status}
                              size="small"
                              color={getStatusColor(project.status)}
                              sx={{ ml: 'auto' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            {project.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  mb: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {project.description}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {project.task_count || 0} tasks • {project.completed_task_count || 0} completed
                              </Typography>
                            </Box>
                            <Box sx={{ width: '100%' }}>
                              <LinearProgress
                                variant="determinate"
                                value={project.progress_percentage || 0}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: '#f4f5f7',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: project.progress_percentage === 100 ? '#00875a' : '#0052cc',
                                  },
                                }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {project.progress_percentage || 0}% complete
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      <ProjectForm
        open={showProjectForm}
        onClose={handleCloseProjectForm}
        onSuccess={handleCloseProjectForm}
      />
    </>
  );
};

export default ProjectSelector;
