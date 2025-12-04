import axios from 'axios';
import { useGlobalErrors } from '../contexts/ErrorContext';

// Global error handling function - this would be called from React components
let globalErrorHandler = null;
export const setGlobalErrorHandler = (handler) => {
  globalErrorHandler = handler;
};

const getToken = () => localStorage.getItem('authToken');

// Create API client instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30 second timeout
});

// Function to sanitize request data
const sanitizeRequestData = (data) => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    // Basic XSS sanitization for strings
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, 'javascript:void(0);')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  
  if (typeof data === 'object') {
    const sanitized = Array.isArray(data) ? [] : {};
    
    for (const [key, value] of Object.entries(data)) {
      // Sanitize key (property name)
      const sanitizedKey = key
        .replace(/<[^>]*>/g, '')
        .replace(/on\w+\s*=/gi, '');
      
      // Sanitize value recursively
      sanitized[sanitizedKey] = sanitizeRequestData(value);
    }
    
    return sanitized;
  }
  
  return data;
};

// Sanitize response data to prevent XSS
const sanitizeResponseData = (data) => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    // Basic sanitization for string responses
    return data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  if (typeof data === 'object') {
    const sanitized = Array.isArray(data) ? [] : {};
    
    for (const [key, value] of Object.entries(data)) {
      // Sanitize key
      const sanitizedKey = key.replace(/<[^>]*>/g, '');
      
      // Sanitize value recursively
      sanitized[sanitizedKey] = sanitizeResponseData(value);
    }
    
    return sanitized;
  }
  
  return data;
};

// Function to generate request ID for correlation
const generateRequestId = () => {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Request interceptor for adding auth tokens, request IDs, and request sanitization
apiClient.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add request ID for tracing
    config.headers['X-Request-ID'] = generateRequestId();
    
    // Sanitize request data
    if (config.data) {
      config.data = sanitizeRequestData(config.data);
    }
    
    // Add request tracking for monitoring
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling responses, sanitization, and error handling
apiClient.interceptors.response.use(
  response => {
    // Calculate response time for monitoring
    response.config.metadata = response.config.metadata || {};
    response.config.metadata.endTime = new Date();
    response.config.metadata.duration = 
      response.config.metadata.endTime - response.config.metadata.startTime;

    // Sanitize response data to prevent XSS
    if (response.data) {
      response.data = sanitizeResponseData(response.data);
    }

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API call to ${response.config.url} took ${response.config.metadata.duration}ms`);
    }

    return response;
  },
  async error => {
    // Calculate response time for error cases
    if (error.config) {
      error.config.metadata = error.config.metadata || {};
      error.config.metadata.endTime = new Date();
      error.config.metadata.duration = 
        error.config.metadata.endTime - (error.config.metadata.startTime || error.config.metadata.endTime);
    }

    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Handle unauthorized access (token expired or invalid)
      if (status === 401) {
        const message = data?.message || '';
        if (message.toLowerCase().includes('token')) {
          localStorage.removeItem('authToken');
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login' && !window.location.pathname.includes('/reset-password')) {
            window.location.href = '/login';
          }
        }
      } 
      // Handle rate limiting
      else if (status === 429) {
        console.warn('Rate limited:', data);
      }
      
      // Log the error
      console.error(
        `API Error (${status}):`, 
        data?.message || data || error.message
      );
      
      // Pass error to global error handler if available
      if (globalErrorHandler) {
        globalErrorHandler(error);
      }
    } else if (error.request) {
      // Request made but no response received (network error)
      console.error('Network error:', error.message);
      
      if (globalErrorHandler) {
        globalErrorHandler(error);
      }
    } else {
      // Something else happened while setting up the request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Function to refresh token automatically if needed
const refreshAuthLogic = async (error) => {
  if (error.response && error.response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      try {
        // Attempt to refresh the access token using the refresh token
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/refresh`, {
          refreshToken
        });
        
        if (response.data.accessToken) {
          // Store the new access token
          localStorage.setItem('authToken', response.data.accessToken);
          
          // Update the original request with new token
          error.config.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
          
          // Retry the original request
          return axios(error.config);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
  }
  
  return Promise.reject(error);
};

// Add token refresh interceptor
apiClient.interceptors.response.use(
  response => response,
  refreshAuthLogic
);

// Add request timing and retry logic for certain errors
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;

    // Retry logic for network errors or server errors (5xx)
    if (!config?.__isRetryRequest && (error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
      config.__isRetryRequest = true;
      config.retryCount = config.retryCount || 0;
      
      if (config.retryCount < 2) { // Retry up to 2 times
        config.retryCount++;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, config.retryCount)));
        
        return apiClient(config);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;