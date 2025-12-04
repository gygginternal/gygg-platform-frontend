import apiClient from './axiosConfig';

/**
 * API service wrapper with enhanced error handling
 */
const apiService = {
  // GET requests
  get: async (url, config = {}) => {
    try {
      return await apiClient.get(url, config);
    } catch (error) {
      // Error is already handled by axios interceptors
      throw error;
    }
  },

  // POST requests
  post: async (url, data = {}, config = {}) => {
    try {
      return await apiClient.post(url, data, config);
    } catch (error) {
      // Error is already handled by axios interceptors
      throw error;
    }
  },

  // PUT requests
  put: async (url, data = {}, config = {}) => {
    try {
      return await apiClient.put(url, data, config);
    } catch (error) {
      // Error is already handled by axios interceptors
      throw error;
    }
  },

  // PATCH requests
  patch: async (url, data = {}, config = {}) => {
    try {
      return await apiClient.patch(url, data, config);
    } catch (error) {
      // Error is already handled by axios interceptors
      throw error;
    }
  },

  // DELETE requests
  delete: async (url, config = {}) => {
    try {
      return await apiClient.delete(url, config);
    } catch (error) {
      // Error is already handled by axios interceptors
      throw error;
    }
  }
};

export default apiService;