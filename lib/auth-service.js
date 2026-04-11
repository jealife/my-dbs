/**
 * Authentication Service
 * Handles API calls for user authentication
 */

import Cookies from 'js-cookie';
import axios from 'axios';
import { apiClient } from './api-client';

export const authService = {
  async testConnection() {
    // Toujours passer par le proxy Next.js — jamais appeler l'IP directement
    // (les appels directs depuis le navigateur sont bloqués par CORS)
    try {
      await axios.get('/actuator/health', { timeout: 3000 });
      return true;
    } catch (e1) {
      try {
        await axios.get('/api/v1/actuator/health', { timeout: 3000 });
        return true;
      } catch (e2) {
        return false;
      }
    }
  },

  /**
   * Register a new user
   * @param {object} userData { first_name, last_name, email, password, role }
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
   * Login user with credentials
   * @param {string} email 
   * @param {string} password 
   */
  async login(email, password) {
    const payload = { email, password };
    console.group('[MyDBS Debug] CONFIG REQUÊTE INFO');
    console.log('URL: /api/auth/login (proxy serveur interne)');
    console.log('Payload:', payload);
    console.groupEnd();

    try {
      // On utilise la route API interne Next.js (/app/api/auth/login/route.js)
      // qui fait le proxy côté serveur pour contourner le CSRF de Spring Boot
      const response = await axios.post('/api/auth/login', payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      const responseData = response.data?.data || response.data || {}
      const { accessToken, token } = responseData
      
      // Si l'objet `user` est absent, tout ce qui reste dans responseData est potentiellement les infos user
      const user = responseData.user || (responseData.role ? responseData : null)

      const finalToken = accessToken || token
      
      console.group('[MyDBS Debug] LOGIN RESPONSE')
      console.log('Status:', response.status)
      console.log('response.data:', JSON.stringify(response.data, null, 2))
      console.log('Extracted user:', JSON.stringify(user, null, 2))
      console.log('Token trouvé:', finalToken ? '✅ OUI' : '❌ NON')
      console.groupEnd()

      // Store info
      if (finalToken) {
        Cookies.set("dbs_token", finalToken, { expires: 1, path: '/' });
        
        if (user) {
          localStorage.setItem("dbs_user", JSON.stringify(user));
          console.log('[MyDBS Debug] ✅ User enregistré dans localStorage')
        } else {
          console.warn('[MyDBS Debug] ⚠️ Aucun objet user dans la réponse. Clés disponibles:', Object.keys(responseData))
        }
      } else {
        console.warn("[MyDBS Debug] ⚠️ Aucun token trouvé. Réponse complète:", JSON.stringify(response.data))
      }
      
      return response.data;
    } catch (error) {
      console.group('[MyDBS Debug] LOGIN ERROR');
      console.error("Status:", error.response?.status);
      console.error("Full Data:", error.response?.data);
      console.error("Headers:", error.response?.headers);
      console.error("Message:", error.message);
      console.groupEnd();
      
      if (error.response) {
        throw new Error(error.response.data?.message || error.response.data?.error || `Erreur Serveur (${error.response.status})`);
      }
      throw new Error("Impossible de se connecter au serveur backend. Vérifiez que l'API est active.");
    }
  },

  /**
   * Logout user
   */
  logout() {
    Cookies.remove("dbs_token");
    localStorage.removeItem("dbs_user");
  },

  /**
   * Get current user from storage
   */
  getCurrentUser() {
    const user = typeof window !== 'undefined' ? localStorage.getItem("dbs_user") : null;
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!Cookies.get("dbs_token");
  }
};
