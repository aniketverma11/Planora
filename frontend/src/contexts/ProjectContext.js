import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMyProjects } from '../services/api';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    // Load selected project from localStorage when projects change
    if (projects.length > 0 && !initialLoadDone) {
      const savedProjectId = localStorage.getItem('selectedProjectId');
      if (savedProjectId) {
        const project = projects.find(p => p.id === parseInt(savedProjectId));
        if (project) {
          setSelectedProject(project);
        }
      }
      setInitialLoadDone(true);
    }
  }, [projects, initialLoadDone]);

  const fetchProjects = async () => {
    try {
      console.log('🔄 ProjectContext: Fetching projects...');
      setLoading(true);
      const response = await getMyProjects();
      console.log('✅ ProjectContext: Projects loaded:', response.data.length);
      setProjects(response.data);
    } catch (error) {
      console.error('❌ ProjectContext: Error fetching projects:', error);
    } finally {
      setLoading(false);
      console.log('✅ ProjectContext: Loading complete');
    }
  };

  const selectProject = (project) => {
    console.log('📌 ProjectContext: Selecting project:', project.name);
    setSelectedProject(project);
    localStorage.setItem('selectedProjectId', project.id.toString());
  };

  const clearProject = () => {
    console.log('🗑️ ProjectContext: Clearing project selection');
    setSelectedProject(null);
    localStorage.removeItem('selectedProjectId');
  };

  const value = {
    selectedProject,
    projects,
    loading,
    fetchProjects,
    selectProject,
    clearProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;
