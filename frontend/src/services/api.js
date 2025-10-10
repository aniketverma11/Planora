import axios from 'axios';

const API_URL = 'http://127.0.0.1:8001/api/';

const api = axios.create({
  baseURL: API_URL,
});

// Token expiration checker
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !isTokenExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token && isTokenExpired(token)) {
    // Token is expired, trigger logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('tokenExpired'));
  }
  return config;
});

// Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('tokenExpired'));
    }
    return Promise.reject(error);
  }
);

export const login = (credentials) => api.post('users/login/', credentials);
export const signup = (userData) => api.post('users/signup/', userData);
export const getUsers = () => api.get('users/');

export const getTasks = () => api.get('tasks/');
export const getAllTasks = () => api.get('tasks/all_tasks/');
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

export default api;
