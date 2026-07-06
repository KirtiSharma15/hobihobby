import axios from 'axios';
import { StorageInterface } from '../types';

// This will be injected by each platform
let storage: StorageInterface | null = null;

export const setStorage = (storageImpl: StorageInterface) => {
  storage = storageImpl;
};

// Get API URL from environment variables
// - Vite (web): import.meta.env.VITE_API_URL
// - Expo (mobile): process.env.EXPO_PUBLIC_API_URL
// - Fallback: localhost for development
const getApiBaseUrl = (): string => {
  // Check Vite environment (web)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check Expo environment (mobile)
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Check window-injected config
  if (typeof window !== 'undefined' && (window as any).ENV?.API_URL) {
    return (window as any).ENV.API_URL;
  }
  
  // Default to localhost for development
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      if (storage) {
        const token = await storage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (storage) {
          // Try to refresh the token
          const refreshToken = await storage.getItem('refreshToken');
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
              refreshToken,
            });

            const { accessToken } = response.data.data;
            await storage.setItem('authToken', accessToken);

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        if (storage) {
          await storage.multiRemove(['authToken', 'refreshToken']);
        }
        console.error('Token refresh failed:', refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions for common API operations
export const apiHelpers = {
  handleError: (error: any) => {
    if (error.response) {
      // Server responded with error status
      return error.response.data.message || 'An error occurred';
    } else if (error.request) {
      // Network error
      return 'Network error. Please check your connection.';
    } else {
      // Other error
      return error.message || 'An unexpected error occurred';
    }
  },

  setAuthTokens: async (accessToken: string, refreshToken: string) => {
    if (storage) {
      await storage.multiSet([
        ['authToken', accessToken],
        ['refreshToken', refreshToken],
      ]);
    }
  },

  clearAuthTokens: async () => {
    if (storage) {
      await storage.multiRemove(['authToken', 'refreshToken']);
    }
  },
};