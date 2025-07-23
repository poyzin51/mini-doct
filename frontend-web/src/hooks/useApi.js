import { useState, useCallback } from 'react';
import { handleApiError } from '../api/errorHandler';

/**
 * Custom hook for API requests with loading and error states
 */
export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const { 
      showToast = true, 
      onSuccess, 
      onError,
      loadingState = true 
    } = options;

    try {
      if (loadingState) setIsLoading(true);
      setError(null);

      const result = await apiCall();
      
      if (onSuccess) onSuccess(result);
      return { success: true, data: result };
    } catch (error) {
      const handledError = handleApiError(error, { showToast });
      setError(handledError);
      
      if (onError) onError(handledError);
      return { success: false, error: handledError };
    } finally {
      if (loadingState) setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    error,
    execute,
    reset,
  };
};

/**
 * Hook for API requests with automatic retry
 */
export const useApiWithRetry = (maxRetries = 3) => {
  const { isLoading, error, execute, reset } = useApi();
  const [retryCount, setRetryCount] = useState(0);

  const executeWithRetry = useCallback(async (apiCall, options = {}) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      setRetryCount(attempt);
      
      const result = await execute(apiCall, {
        ...options,
        showToast: attempt === maxRetries, // Only show toast on final attempt
      });
      
      if (result.success) {
        setRetryCount(0);
        return result;
      }
      
      lastError = result.error;
      
      // Don't retry on certain error types
      if (lastError?.type === 'AUTH_ERROR' || 
          lastError?.type === 'VALIDATION_ERROR' ||
          lastError?.type === 'PERMISSION_ERROR') {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    setRetryCount(0);
    return { success: false, error: lastError };
  }, [execute, maxRetries]);

  return {
    isLoading,
    error,
    retryCount,
    execute: executeWithRetry,
    reset,
  };
};

export default useApi;