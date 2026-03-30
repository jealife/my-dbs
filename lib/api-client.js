import axios from 'axios';
import Cookies from 'js-cookie';

// On utilise /api comme base, le v1 sera ajouté au cas par cas dans les services
// ou via les variables d'environnement pour plus de flexibilité.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
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
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);
