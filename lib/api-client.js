import axios from 'axios';
import Cookies from 'js-cookie';

/**
 * Client HTTP centralisé.
 *
 * L'authentification fonctionne ainsi :
 *  - Le token JWT (dbs_token) est un cookie HttpOnly posé par /api/auth/login.
 *  - Il est illisible côté JavaScript — c'est voulu (protection XSS).
 *  - `withCredentials: true` demande au navigateur de l'envoyer automatiquement
 *    avec chaque requête vers le proxy Next.js (/api/[...path]).
 *  - Le proxy lit le cookie côté serveur et ajoute le header Authorization avant
 *    de transmettre la requête au backend Java.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // envoie dbs_token (HttpOnly) et dbs_session automatiquement
  headers: {
    'Accept': 'application/json',
  },
});

/**
 * Response Interceptor — redirige vers /login sur 401
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expirée — nettoyer l'état client et rediriger
      localStorage.removeItem('dbs_user');
      Cookies.remove('dbs_session', { path: '/' });
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);
