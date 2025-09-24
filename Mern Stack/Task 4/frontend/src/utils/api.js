import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));

// Global response error handler
api.interceptors.response.use(response => response, error => {
  // Optionally handle 401 globally
  if (error.response && error.response.status === 401) {
    // auto logout if wanted
    localStorage.removeItem('token');
    // window.location.href = '/login'; // don't force during tests
  }
  return Promise.reject(error);
});

export default api;
