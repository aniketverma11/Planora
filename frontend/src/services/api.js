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
