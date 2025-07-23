import toast from 'react-hot-toast';
import { TOAST_MESSAGES } from '../utils/constants';

/**
 * Centralized error handling utilities
 */

/**
 * Error types for consistent handling
 */
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  API_ERROR: 'API_ERROR',
};

/**
 * Create standardized error object
 * @param {string} type - Error type
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Object} Standardized error object
 */
export const createError = (type, message, details = {}) => ({
  type,
  message,
  timestamp: new Date().toISOString(),
  ...details,
});

/**
 * Handle authentication errors
 * @param {Object} error - Error object
 */
export const handleAuthError = (error) => {
  // Clear stored auth data
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  
  // Show error message
  toast.error('Session expired. Please login again.');
  
  // Redirect to login if not already there
  if (!window.location.pathname.includes('/login')) {
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }
};

/**
 * Handle validation errors for forms
 * @param {Object} error - Error object with validation details
 * @returns {Object} Formatted validation errors
 */
export const handleValidationError = (error) => {
  const validationErrors = {};
  
  if (error.data && error.data.errors) {
    // Backend validation errors
    Object.keys(error.data.errors).forEach(field => {
      validationErrors[field] = error.data.errors[field];
    });
  } else if (error.data && error.data.message) {
    // Single validation message
    validationErrors.general = error.data.message;
  }
  
  return validationErrors;
};

/**
 * Handle network errors
 * @param {Object} error - Error object
 */
export const handleNetworkError = (error) => {
  console.error('Network error:', error);
  toast.error(TOAST_MESSAGES.NETWORK_ERROR);
};

/**
 * Handle server errors (5xx)
 * @param {Object} error - Error object
 */
export const handleServerError = (error) => {
  console.error('Server error:', error);
  toast.error('Server error. Please try again later.');
};

/**
 * Handle generic API errors
 * @param {Object} error - Error object
 * @param {string} defaultMessage - Default error message
 */
export const handleGenericError = (error, defaultMessage = TOAST_MESSAGES.GENERIC_ERROR) => {
  console.error('API error:', error);
  const message = error.data?.message || error.message || defaultMessage;
  toast.error(message);
};

/**
 * Main error handler that routes to specific handlers
 * @param {Object} error - Error object
 * @param {Object} options - Handling options
 */
export const handleApiError = (error, options = {}) => {
  const { 
    showToast = true, 
    defaultMessage = TOAST_MESSAGES.GENERIC_ERROR,
    onAuthError,
    onValidationError,
  } = options;

  // Don't show toast if explicitly disabled
  if (!showToast) {
    return error;
  }

  switch (error.type) {
    case ERROR_TYPES.AUTH_ERROR:
      handleAuthError(error);
      if (onAuthError) onAuthError(error);
      break;

    case ERROR_TYPES.VALIDATION_ERROR:
      const validationErrors = handleValidationError(error);
      if (onValidationError) onValidationError(validationErrors);
      return validationErrors;

    case ERROR_TYPES.NETWORK_ERROR:
      handleNetworkError(error);
      break;

    case ERROR_TYPES.SERVER_ERROR:
      handleServerError(error);
      break;

    case ERROR_TYPES.PERMISSION_ERROR:
      toast.error('You do not have permission to perform this action');
      break;

    case ERROR_TYPES.NOT_FOUND_ERROR:
      toast.error('Resource not found');
      break;

    case ERROR_TYPES.RATE_LIMIT_ERROR:
      toast.error('Too many requests. Please try again later.');
      break;

    default:
      handleGenericError(error, defaultMessage);
      break;
  }

  return error;
};

/**
 * Async wrapper for API calls with error handling
 * @param {Function} apiCall - API call function
 * @param {Object} options - Error handling options
 * @returns {Promise} Promise with handled errors
 */
export const withErrorHandling = async (apiCall, options = {}) => {
  try {
    const result = await apiCall();
    return { success: true, data: result };
  } catch (error) {
    const handledError = handleApiError(error, options);
    return { success: false, error: handledError };
  }
};

/**
 * Retry wrapper for API calls
 * @param {Function} apiCall - API call function
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise} Promise with retry logic
 */
export const withRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain error types
      if (error.type === ERROR_TYPES.AUTH_ERROR || 
          error.type === ERROR_TYPES.VALIDATION_ERROR ||
          error.type === ERROR_TYPES.PERMISSION_ERROR) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};