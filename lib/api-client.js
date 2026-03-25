import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '/api') + '/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000, // Timeout pour éviter que l'UI reste bloquée en cas de serveur hors-ligne
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Adds Authorisation header to every request if token exists
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('dbs_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle global errors (like 401 Unauthorized)
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Automatic logout on token expiration
      Cookies.remove("dbs_token");
      localStorage.removeItem("dbs_user");
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
