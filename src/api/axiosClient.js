import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const axiosClient = axios.create({
  baseURL: API_URL
});

// Add token to request headers
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401, redirect to login (handled by frontend routing)
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      // Dispatch custom event so components can respond
      window.dispatchEvent(new Event('auth-error'));
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
