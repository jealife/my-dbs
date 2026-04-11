import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT (depuis le cookie dbs_token)
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('dbs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      Cookies.remove('dbs_token');
      localStorage.removeItem('dbs_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);
