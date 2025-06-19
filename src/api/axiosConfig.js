import axios from 'axios';

const getToken = () => localStorage.getItem('authToken');

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
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
        console.warn(
          `API Auth Error (${error.response.status}): ${message}. Logging out.`
        );
        localStorage.removeItem('authToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else {
        console.warn(
          `API Auth/Permission Error (${error.response.status}): ${message}`
        );
      }
    } else if (error.response) {
      console.error(
        `API Error (${error.response.status}): ${error.response.data?.message || error.message}`
      );
    } else {
      console.error('API Network Error or CORS issue:', error.message);
    }
    return Promise.reject(error);
  }
);
export default apiClient;
