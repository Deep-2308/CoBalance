import axios from 'axios';

// VITE_API_BASE_URL should be the full base URL including /api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401/403 gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Session expired or invalid token
      if (status === 401 || status === 403) {
        // Only auto-logout for token issues, not for auth page requests
        const url = error.config?.url || '';
        const isAuthRoute = url.includes('/auth/');

        if (!isAuthRoute) {
          console.warn(`🚪 Session expired — [${status}] ${url}`, error.response.data);
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          // Dispatch custom event so AuthContext can react
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
        }
      }

      // Rate limited
      if (status === 429) {
        console.warn('⏱️ Rate limited:', error.response.data?.error);
      }

      // Account locked
      if (status === 423) {
        console.warn('🔒 Account locked:', error.response.data?.error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
