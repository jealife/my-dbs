/**
 * Authentication Service
 * Handles API calls for user authentication.
 *
 * Le token JWT est géré exclusivement côté serveur via un cookie HttpOnly.
 * Ce service ne stocke jamais le token en localStorage ni en cookie JS-accessible.
 */

import Cookies from 'js-cookie';
import axios from 'axios';
import { apiClient } from './api-client';

export const authService = {
  async testConnection() {
    try {
      await axios.get('/actuator/health', { timeout: 3000 });
      return true;
    } catch {
      try {
        await axios.get('/api/v1/actuator/health', { timeout: 3000 });
        return true;
      } catch {
        return false;
      }
    }
  },

  /**
   * Register a new user
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || "Échec de l'inscription");
      }
      throw new Error("Impossible de se connecter au serveur.");
    }
  },

  /**
   * Login — le cookie HttpOnly est posé par la route serveur /api/auth/login.
   * Ce service stocke uniquement le profil utilisateur (sans token) en localStorage.
   */
  async login(email, password) {
    try {
      const response = await axios.post('/api/auth/login', { email, password }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      const responseData = response.data?.data || response.data || {};
      const user = responseData.user || (responseData.role ? responseData : null);

      // Stocker uniquement le profil (jamais le token)
      if (user) {
        localStorage.setItem('dbs_user', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data?.message ||
          error.response.data?.error ||
          `Erreur Serveur (${error.response.status})`
        );
      }
      throw new Error("Impossible de se connecter au serveur backend. Vérifiez que l'API est active.");
    }
  },

  /**
   * Logout — supprime les cookies via la route serveur et nettoie le localStorage.
   */
  async logout() {
    try {
      await fetch('/api/auth/login', { method: 'DELETE', credentials: 'include' });
    } catch {
      // Continuer même si l'appel échoue
    }
    localStorage.removeItem('dbs_user');
    // Supprimer le cookie de session accessible au JS
    Cookies.remove('dbs_session', { path: '/' });
  },

  /**
   * Get current user from localStorage (profil uniquement, pas de token)
   */
  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('dbs_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Vérifie l'état de connexion via le cookie de session (pas le token HttpOnly)
   */
  isAuthenticated() {
    return !!Cookies.get('dbs_session');
  },
};
