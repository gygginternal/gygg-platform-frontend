import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { sanitizeContent } from '../utils/xssPrevention';
import PropTypes from 'prop-types';

// Error types
const ERROR_TYPES = {
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNAUTHORIZED_ERROR: 'UNAUTHORIZED_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
};

// Initial state
const initialState = {
  errors: [],
  lastError: null,
  errorCount: 0
};

// Reducer for error state management
const errorReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ERROR':
      const newError = {
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString()
      };
      return {
        ...state,
        errors: [newError, ...state.errors].slice(0, 10), // Keep only last 10 errors
        lastError: newError,
        errorCount: state.errorCount + 1
      };
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload.id),
        errorCount: Math.max(0, state.errorCount - 1)
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: [],
        lastError: null,
        errorCount: 0
      };
    case 'CLEAR_ERROR_BY_TYPE':
      return {
        ...state,
        errors: state.errors.filter(error => error.type !== action.payload.type)
      };
    default:
      return state;
  }
};

// Error context
const ErrorContext = createContext();

// Custom hook to use error context
export const useErrorHandler = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within an ErrorProvider');
  }
  return context;
};

// Error provider component
export const ErrorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  // Add an error to the context with XSS prevention
  const addError = (error, type = ERROR_TYPES.CLIENT_ERROR, metadata = {}) => {
    // Sanitize error message to prevent XSS
    const errorMessage = error.message || error;
    const sanitizedMessage = sanitizeContent(errorMessage);

    dispatch({
      type: 'ADD_ERROR',
      payload: {
        message: sanitizedMessage,
        type,
        metadata,
        originalError: error
      }
    });
  };

  // Remove a specific error
  const removeError = (errorId) => {
    dispatch({
      type: 'REMOVE_ERROR',
      payload: { id: errorId }
    });
  };

  // Clear all errors
  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  // Clear errors by type
  const clearErrorsByType = (type) => {
    dispatch({
      type: 'CLEAR_ERROR_BY_TYPE',
      payload: { type }
    });
  };

  // Log error for debugging/sentry
  const logError = (error, context = {}) => {
    console.error('Global error handler:', { error, context, timestamp: new Date().toISOString() });
    
    // In a real app, you would send this to an error reporting service like Sentry
    // Example: Sentry.captureException(error, { contexts: { custom: context } });
  };

  // Handle API errors specifically with XSS prevention
  const handleApiError = (error, context = {}) => {
    let errorType = ERROR_TYPES.API_ERROR;
    let errorMessage = error.message || 'An API error occurred';

    // Determine specific error type based on response
    if (error.response) {
      const { status } = error.response;
      if (status >= 500) {
        errorType = ERROR_TYPES.SERVER_ERROR;
        errorMessage = error.response.data?.message || 'Server error occurred';
      } else if (status === 401) {
        errorType = ERROR_TYPES.UNAUTHORIZED_ERROR;
        errorMessage = 'Unauthorized access. Please log in again.';
      } else if (status === 429) {
        errorType = ERROR_TYPES.API_ERROR;
        errorMessage = 'Too many requests. Please try again later.';
      } else if (status >= 400) {
        errorType = ERROR_TYPES.VALIDATION_ERROR;
        errorMessage = error.response.data?.message || `Request failed: ${status}`;
      }
    } else if (error.request) {
      // Network error
      errorType = ERROR_TYPES.NETWORK_ERROR;
      errorMessage = 'Network error. Please check your connection.';
    }

    // Sanitize the error message before adding it
    const sanitizedErrorMessage = sanitizeContent(errorMessage);
    addError({ message: sanitizedErrorMessage, ...error }, errorType, context);
    logError(error, { ...context, type: errorType });
  };

  // Handle uncaught errors (global)
  useEffect(() => {
    const handleError = (event) => {
      addError(
        { message: event.message, stack: event.error?.stack },
        ERROR_TYPES.CLIENT_ERROR,
        { source: 'global', filename: event.filename, lineno: event.lineno, colno: event.colno }
      );
      logError(event.error || new Error(event.message), { source: 'global' });
    };

    const handleUnhandledRejection = (event) => {
      addError(
        { message: 'Unhandled promise rejection', reason: event.reason },
        ERROR_TYPES.CLIENT_ERROR,
        { source: 'promise' }
      );
      logError(event.reason, { source: 'promise' });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const value = {
    ...state,
    addError,
    removeError,
    clearErrors,
    clearErrorsByType,
    handleApiError,
    ERROR_TYPES
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

ErrorProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Hook to access error context easily
export const useGlobalErrors = () => {
  const context = useErrorHandler();
  
  // Convenience methods
  const hasErrors = context.errors.length > 0;
  const apiErrors = context.errors.filter(error => 
    error.type === context.ERROR_TYPES.API_ERROR || 
    error.type === context.ERROR_TYPES.SERVER_ERROR ||
    error.type === context.ERROR_TYPES.VALIDATION_ERROR
  );
  const networkErrors = context.errors.filter(error => 
    error.type === context.ERROR_TYPES.NETWORK_ERROR
  );

  return {
    ...context,
    hasErrors,
    apiErrors,
    networkErrors,
    hasApiErrors: apiErrors.length > 0,
    hasNetworkErrors: networkErrors.length > 0
  };
};