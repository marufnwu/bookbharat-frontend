// Export axiosInstance for blog service and other services that need direct axios access
import axios from 'axios';
import { authStore } from '@/stores/auth';

// Create axios instance similar to the one in ApiClient
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const sessionId = localStorage.getItem('guest_session_id');
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }
  }
  return config;
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        authStore.handleUnauthorized();

        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/auth/')) {
          const returnUrl = encodeURIComponent(currentPath + window.location.search);
          window.location.href = `/auth/login?redirect=${returnUrl}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

// Also re-export the main API client for convenience
export { apiClient } from '@/lib/api';