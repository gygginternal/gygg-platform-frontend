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

// Simple cache to store recent requests and their timestamps
const requestCache = new Map();

// Simple cache to track rate limited endpoints
const rateLimitedEndpoints = new Map();

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

// Request interceptor for adding auth tokens, request IDs, request sanitization, and rate limiting
apiClient.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add request ID for tracing
    config.headers['X-Request-ID'] = generateRequestId();

    // Client-side rate limiting: Prevent too frequent requests to same endpoint
    const cacheKey = `${config.method?.toUpperCase()}_${config.url}`;
    const now = Date.now();
    const cachedRequest = requestCache.get(cacheKey);

    // Different debounce times for different endpoints
    // Default debounce times (in ms): faster for essential endpoints, slower for heavy operations
    const endpointDebounceTimes = {
      // Heavy data endpoints - higher debounce
      '/gigs': 50, // 50ms for gigs endpoint - reduced for multi-component apps
      '/gigs/': 50, // 50ms for gigs with params - reduced for multi-component apps
      '/gigs/top-match': 75, // 75ms for top match endpoint
      '/gigs/top-match/': 75, // 75ms for top match with params
      '/applications/my-gigs': 50, // 50ms for my-gigs endpoint - faster for initial page load
      '/applications': 50, // 50ms for general applications endpoint
      '/chat/conversations': 75, // 75ms for chat conversations
      '/contracts': 75, // 75ms for contracts endpoints
      '/posts': 50, // 50ms for posts - faster for feed loading
      '/users/me': 50, // 50ms for user profile - commonly accessed
      // Default debounce for other GET requests
      'default': 50, // 50ms for most other requests - less aggressive
    };

    // Determine debounce time based on endpoint
    let debounceTime = endpointDebounceTimes.default;
    for (const [endpoint, time] of Object.entries(endpointDebounceTimes)) {
      if (endpoint !== 'default' && config.url.includes(endpoint)) {
        debounceTime = time;
        break;
      }
    }

    // Prevent requests to same endpoint with same parameters within debounce time (except for POST, PUT, DELETE which are different)
    // Create a more specific cache key that includes parameters to differentiate requests
    const fullCacheKey = `${config.method?.toUpperCase()}_${config.url}_${JSON.stringify(config.params || {})}`;
    const fullCachedRequest = requestCache.get(fullCacheKey);

    if (fullCachedRequest &&
        ['GET', 'HEAD', 'OPTIONS'].includes(config.method?.toUpperCase()) &&
        (now - fullCachedRequest.timestamp) < debounceTime) {
      console.warn(`Request throttled for ${fullCacheKey}. Last request was ${(now - fullCachedRequest.timestamp)}ms ago. Required: ${debounceTime}ms.`);
      // Return a rejected promise to simulate a client-side throttle
      return Promise.reject({
        isClientThrottled: true,
        message: 'Request throttled by client-side rate limiting',
        config: config
      });
    }

    // Store request in cache with full parameters
    requestCache.set(fullCacheKey, { timestamp: now });

    // Check if this endpoint is currently rate-limited by server
    const rateLimitInfo = rateLimitedEndpoints.get(cacheKey);
    if (rateLimitInfo && (now < rateLimitInfo.resetTime)) {
      console.warn(`Request blocked - endpoint still rate limited: ${cacheKey}`);
      return Promise.reject({
        isServerRateLimited: true,
        message: `Endpoint temporarily unavailable due to server rate limiting. Try again in ${Math.ceil((rateLimitInfo.resetTime - now) / 1000)} seconds.`,
        config: config
      });
    }

    // Sanitize request data
    if (config.data) {
      config.data = sanitizeRequestData(config.data);
    }

    // Add request tracking for monitoring
    config.metadata = { startTime: new Date() };

    // Store request in cache
    requestCache.set(cacheKey, { timestamp: now });

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
      // Handle rate limiting with proper error notification and endpoint tracking
      else if (status === 429) {
        console.warn('Rate limited:', data);

        // Extract retry-after header if available, otherwise use a sensible default
        const retryAfter = parseInt(error.response.headers['retry-after']) || 30; // Default to 30 seconds
        const cacheKey = `${error.config.method?.toUpperCase()}_${error.config.url}`;
        const now = Date.now();

        // Track this endpoint as rate-limited
        rateLimitedEndpoints.set(cacheKey, {
          resetTime: now + (retryAfter * 1000),
          timestamp: now
        });

        // Show user-friendly message for rate limiting
        if (globalErrorHandler) {
          globalErrorHandler({
            ...error,
            message: `Rate limited. Please try again in ${retryAfter} seconds.`,
            isRateLimited: true,
            retryAfter: retryAfter
          });
        }
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

    // Retry logic for network errors and server errors (5xx)
    // Avoid retrying 429 errors since those indicate rate limiting that should be respected
    const shouldRetry = !config?.__isRetryRequest &&
      (error.code === 'ECONNABORTED' ||
       error.response?.status >= 500);

    if (shouldRetry) {
      config.__isRetryRequest = true;
      config.retryCount = config.retryCount || 0;

      if (config.retryCount < 2) { // Retry up to 2 times for network/server errors
        config.retryCount++;

        // Exponential backoff for network/server errors
        const delay = 1000 * Math.pow(2, config.retryCount);

        // Wait for the calculated delay before retrying
        await new Promise(resolve => setTimeout(resolve, delay));

        return apiClient(config);
      }
    }

    // For 429 errors, we should NOT retry automatically since it's rate limiting
    // Just return the original error so components can handle it appropriately
    return Promise.reject(error);
  }
);

export default apiClient;