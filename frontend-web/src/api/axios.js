import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS, TOAST_MESSAGES } from '../utils/constants';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response, request } = error;

    // Network error (no response received)
    if (!response) {
      console.error('Network error:', error.message);
      toast.error(TOAST_MESSAGES.NETWORK_ERROR);
      return Promise.reject({
        type: 'NETWORK_ERROR',
        message: TOAST_MESSAGES.NETWORK_ERROR,
        originalError: error,
      });
    }

    // HTTP error responses
    const { status, data } = response;

    switch (status) {
      case 401:
        // Unauthorized - token expired or invalid
        console.error('Authentication error:', data);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject({
          type: 'AUTH_ERROR',
          message: 'Session expired. Please login again.',
          status,
          data,
        });

      case 403:
        // Forbidden
        console.error('Permission error:', data);
        toast.error('You do not have permission to perform this action');
        return Promise.reject({
          type: 'PERMISSION_ERROR',
          message: 'Permission denied',
          status,
          data,
        });

      case 404:
        // Not found
        console.error('Resource not found:', data);
        return Promise.reject({
          type: 'NOT_FOUND_ERROR',
          message: 'Resource not found',
          status,
          data,
        });

      case 422:
        // Validation error
        console.error('Validation error:', data);
        return Promise.reject({
          type: 'VALIDATION_ERROR',
          message: data.message || 'Validation failed',
          status,
          data,
          errors: data.errors || {},
        });

      case 429:
        // Rate limit exceeded
        console.error('Rate limit exceeded:', data);
        toast.error('Too many requests. Please try again later.');
        return Promise.reject({
          type: 'RATE_LIMIT_ERROR',
          message: 'Rate limit exceeded',
          status,
          data,
        });

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        console.error('Server error:', data);
        toast.error('Server error. Please try again later.');
        return Promise.reject({
          type: 'SERVER_ERROR',
          message: 'Server error',
          status,
          data,
        });

      default:
        // Other errors
        console.error('API error:', data);
        const errorMessage = data?.message || TOAST_MESSAGES.GENERIC_ERROR;
        toast.error(errorMessage);
        return Promise.reject({
          type: 'API_ERROR',
          message: errorMessage,
          status,
          data,
        });
    }
  }
);

// API helper functions
export const apiHelpers = {
  /**
   * Handle API response and extract data
   * @param {Promise} apiCall - API call promise
   * @returns {Promise} Promise with response data
   */
  handleResponse: async (apiCall) => {
    try {
      const response = await apiCall;
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Handle API error and show appropriate message
   * @param {Error} error - API error
   * @param {string} defaultMessage - Default error message
   */
  handleError: (error, defaultMessage = TOAST_MESSAGES.GENERIC_ERROR) => {
    if (error.type === 'NETWORK_ERROR') {
      // Network error already handled by interceptor
      return;
    }

    if (error.type === 'VALIDATION_ERROR') {
      // Return validation errors for form handling
      return error.errors;
    }

    // For other errors, show toast if not already shown
    if (!error.toastShown) {
      toast.error(error.message || defaultMessage);
    }
  },

  /**
   * Create form data for file uploads
   * @param {Object} data - Data to convert to FormData
   * @returns {FormData} FormData object
   */
  createFormData: (data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    return formData;
  },

  /**
   * Build query string from parameters
   * @param {Object} params - Query parameters
   * @returns {string} Query string
   */
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    return searchParams.toString();
  },
};

// Export configured axios instance
export default apiClient;