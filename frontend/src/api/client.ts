import axios from 'axios';

let apiBaseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
if (apiBaseURL) {
  apiBaseURL = apiBaseURL.trim().replace(/\/$/, '');
  if (!apiBaseURL.endsWith('/api')) {
    apiBaseURL = `${apiBaseURL}/api`;
  }
}

const apiClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('API Client initialized with baseURL:', apiClient.defaults.baseURL);

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Response interceptor for auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
