import axios from 'axios';

// Use environment variable or fallback to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

console.log('🌐 API Configuration:', {
  mode: process.env.NODE_ENV,
  apiUrl: API_URL,
  baseURL: API_URL.endsWith('/') ? API_URL : `${API_URL}/`
});

const api = axios.create({
  baseURL: API_URL.endsWith('/') ? API_URL : `${API_URL}/`,
});

// Token expiration checker
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const expired = payload.exp < currentTime;
    console.log('🔍 API Token Check:', {
      exp: new Date(payload.exp * 1000).toLocaleString(),
      currentTime: new Date(currentTime * 1000).toLocaleString(),
      expired
    });
    return expired;
  } catch (error) {
    console.error('❌ Error checking token expiration:', error);
    return true;
  }
};

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('📤 API Request:', config.url, 'Token exists:', !!token);
  
  if (token && !isTokenExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Token added to request');
  } else if (token && isTokenExpired(token)) {
    // Token is expired, trigger logout
    console.log('⚠️ Token expired in request interceptor, clearing auth');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('tokenExpired'));
  } else {
    console.log('ℹ️ No token available for request');
  }
  return config;
});

// Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('📥 API Response Error:', error.response?.status, error.config?.url);
    if (error.response?.status === 401) {
      console.log('⚠️ 401 Unauthorized - clearing auth');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('tokenExpired'));
    }
    return Promise.reject(error);
  }
);

export const login = (credentials) => api.post('users/login/', credentials);
export const signup = (userData) => api.post('users/signup/', userData);
export const googleAuth = (token) => api.post('users/google-auth/', { token });
export const microsoftAuth = (token) => api.post('users/microsoft-auth/', { token });
export const getUsers = () => api.get('users/list/'); // Changed from 'users/' to 'users/list/' to get all users for dropdowns

// Project APIs
export const getProjects = () => api.get('projects/');
export const getMyProjects = () => api.get('projects/my_projects/');
export const getProject = (projectId) => api.get(`projects/${projectId}/`);
export const createProject = (projectData) => api.post('projects/', projectData);
export const updateProject = (projectId, projectData) => api.put(`projects/${projectId}/`, projectData);
export const deleteProject = (projectId) => api.delete(`projects/${projectId}/`);
export const getProjectStats = (projectId) => api.get(`projects/${projectId}/stats/`);
export const addProjectMember = (projectId, userId) => api.post(`projects/${projectId}/add_member/`, { user_id: userId });
export const removeProjectMember = (projectId, userId) => api.post(`projects/${projectId}/remove_member/`, { user_id: userId });

// Task APIs
export const getTasks = (projectId = null) => {
  const url = projectId ? `tasks/?project_id=${projectId}` : 'tasks/';
  return api.get(url);
};
export const getAllTasks = (projectId = null) => {
  const url = projectId ? `tasks/all_tasks/?project_id=${projectId}` : 'tasks/all_tasks/';
  return api.get(url);
};
export const getSubTasks = (taskId) => api.get(`tasks/${taskId}/subtasks/`);
export const createTask = (taskData) => api.post('tasks/', taskData);
export const updateTask = (taskId, taskData) => api.put(`tasks/${taskId}/`, taskData);
export const deleteTask = (taskId) => api.delete(`tasks/${taskId}/`);

// Document APIs
export const uploadDocument = (taskId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`tasks/${taskId}/upload_document/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getTaskDocuments = (taskId) => api.get(`tasks/${taskId}/documents/`);
export const deleteDocument = (taskId, documentId) => api.delete(`tasks/${taskId}/delete_document/${documentId}/`);

// Excel APIs
export const exportTasksToExcel = (projectId) => {
  return api.get(`tasks/export_excel/?project_id=${projectId}`, {
    responseType: 'blob',
  });
};

export const downloadSampleExcel = () => {
  return api.get('tasks/download_sample/', {
    responseType: 'blob',
  });
};

export const importTasksFromExcel = (projectId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('project_id', projectId);
  return api.post('tasks/import_excel/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Critical Path APIs
export const getCriticalPath = (projectId) => {
  return api.get(`tasks/critical_path/?project_id=${projectId}`);
};

export const calculateCriticalPath = (projectId) => {
  return api.post('tasks/calculate_critical_path/', { project_id: projectId });
};

export const getFloatAnalysis = (projectId) => {
  return api.get(`tasks/float_analysis/?project_id=${projectId}`);
};

export default api;
