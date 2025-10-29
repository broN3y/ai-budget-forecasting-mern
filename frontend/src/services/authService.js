import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/auth';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/refresh-token`, {
            refreshToken,
          });
          
          const { token, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Register user
const register = async (userData) => {
  const response = await api.post('/register', userData);
  
  if (response.data.success) {
    const { user, token, refreshToken } = response.data.data;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }
  
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await api.post('/login', userData);
  
  if (response.data.success) {
    const { user, token, refreshToken } = response.data.data;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }
  
  return response.data;
};

// Logout user
const logout = async () => {
  try {
    await api.post('/logout');
  } catch (error) {
    // Continue with logout even if server request fails
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
};

// Get user profile
const getProfile = async () => {
  const response = await api.get('/me');
  
  if (response.data.success) {
    const { user } = response.data.data;
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  return response.data;
};

// Update user profile
const updateProfile = async (userData) => {
  const response = await api.put('/profile', userData);
  
  if (response.data.success) {
    const { user } = response.data.data;
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  return response.data;
};

// Forgot password
const forgotPassword = async (email) => {
  const response = await api.post('/forgot-password', { email });
  return response.data;
};

// Reset password
const resetPassword = async (token, password) => {
  const response = await api.put(`/reset-password/${token}`, { password });
  return response.data;
};

// Refresh token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await api.post('/refresh-token', { refreshToken });
  
  if (response.data.success) {
    const { token, refreshToken: newRefreshToken } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', newRefreshToken);
  }
  
  return response.data;
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Get current user from localStorage
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

const authService = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  refreshToken,
  isAuthenticated,
  getCurrentUser,
  getToken,
};

export default authService;