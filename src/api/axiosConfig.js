import axios from 'axios';

const getToken = () => localStorage.getItem('authToken');

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30 second timeout
});

apiClient.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      const message = error.response.data?.message || '';
      if (message.toLowerCase().includes('token')) {
        localStorage.removeItem('authToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.response) {
      console.error(
        `API Error (${error.response.status}): ${error.response.data?.message || error.message}`
      );
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server took too long to respond');
      error.message = 'Request timeout. Please try again.';
    } else if (
      error.message &&
      error.message.toLowerCase().includes('network')
    ) {
      console.error('Network error:', error.message);
      error.message = 'Network error. Please check your connection.';
    }
    return Promise.reject(error);
  }
);
export default apiClient;
