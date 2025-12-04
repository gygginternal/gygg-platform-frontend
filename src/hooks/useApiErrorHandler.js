import { useCallback } from 'react';
import { useGlobalErrors } from '../contexts/ErrorContext';

/**
 * Custom hook for handling API errors using the error context
 */
export const useApiErrorHandler = () => {
  const { handleApiError } = useGlobalErrors();

  const handleApiCall = useCallback(async (apiCall, context = {}) => {
    try {
      return await apiCall();
    } catch (error) {
      handleApiError(error, context);
      throw error; // Re-throw so calling code can handle it if needed
    }
  }, [handleApiError]);

  return {
    handleApiCall,
    handleApiError,
  };
};