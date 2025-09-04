import { useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';

/**
 * Custom hook for consistent error handling across the application
 * Provides unified error state management and display options
 */
export const useErrorHandler = (options = {}) => {
  const {
    showToast: enableToast = false,
    clearOnChange = true,
    logErrors = true,
  } = options;

  const [errors, setErrors] = useState([]);
  const showToast = useToast();

  // Set a single error
  const setError = useCallback(
    error => {
      if (!error) {
        setErrors([]);
        return;
      }

      const errorMessage =
        typeof error === 'string'
          ? error
          : error.message || 'An unexpected error occurred';

      setErrors([errorMessage]);

      if (enableToast) {
        showToast(errorMessage, { type: 'error' });
      }

      if (logErrors) {
        console.error('Error:', error);
      }
    },
    [enableToast, showToast, logErrors]
  );

  // Set multiple errors
  const setMultipleErrors = useCallback(
    errorList => {
      if (!errorList || errorList.length === 0) {
        setErrors([]);
        return;
      }

      const processedErrors = errorList
        .filter(Boolean)
        .map(error =>
          typeof error === 'string'
            ? error
            : error.message || 'An error occurred'
        );

      setErrors(processedErrors);

      if (enableToast && processedErrors.length > 0) {
        showToast(
          processedErrors.length === 1
            ? processedErrors[0]
            : `${processedErrors.length} errors occurred`,
          { type: 'error' }
        );
      }

      if (logErrors) {
        console.error('Multiple errors:', errorList);
      }
    },
    [enableToast, showToast, logErrors]
  );

  // Handle API errors with consistent formatting
  const handleApiError = useCallback(
    error => {
      let errorMessage = 'An unexpected error occurred';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = Object.values(
          error.response.data.errors
        ).flat();
        setMultipleErrors(validationErrors);
        return;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    },
    [setError, setMultipleErrors]
  );

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Clear errors on input change (if enabled)
  const clearOnInputChange = useCallback(() => {
    if (clearOnChange && errors.length > 0) {
      clearErrors();
    }
  }, [clearOnChange, errors.length, clearErrors]);

  // Check if there are any errors
  const hasErrors = errors.length > 0;

  // Get the first error (for simple displays)
  const firstError = errors[0] || null;

  return {
    errors,
    hasErrors,
    firstError,
    setError,
    setMultipleErrors,
    handleApiError,
    clearErrors,
    clearOnInputChange,
  };
};

export default useErrorHandler;
