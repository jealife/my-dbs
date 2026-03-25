import { apiClient } from '../client';

const BASE_URL = '/api/v1/admissions';

// ─────────────────────── CRUD APPLICATION ───────────────────────────────

export const admissionsApi = {
  /**
   * Créer une candidature (DRAFT)
   */
  create: async (data) => {
    const response = await apiClient.post(BASE_URL, data);
    return response.data.data;
  },

  /**
   * Lister les candidatures avec pagination et filtre par statut
   */
  getAll: async (params) => {
    const response = await apiClient.get(BASE_URL, { params });
    return response.data.data;
  },

  /**
   * Récupérer le détail d'une candidature
   */
  getById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  /**
   * Modifier une candidature (uniquement en DRAFT)
   */
  update: async (id, data) => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  /**
   * Changer le statut d'une candidature (workflow)
   */
  changeStatus: async (id, data) => {
    const response = await apiClient.patch(`${BASE_URL}/${id}/status`, data);
    return response.data.data;
  },

  /**
   * Archiver une candidature (soft delete)
   */
  archive: async (id) => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  // ─────────────────────── DOCUMENTS ──────────────────────────────────────

  /**
   * Uploader une pièce justificative
   */
  uploadDocument: async (applicationId, documentType, file) => {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);

    const response = await apiClient.post(
      `${BASE_URL}/${applicationId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Lister les documents d'une candidature
   */
  getDocuments: async (applicationId) => {
    const response = await apiClient.get(`${BASE_URL}/${applicationId}/documents`);
    return response.data.data;
  },

  /**
   * Supprimer un document (soft delete)
   */
  deleteDocument: async (documentId) => {
    await apiClient.delete(`${BASE_URL}/documents/${documentId}`);
  },

  /**
   * Vérifier/invalider une pièce justificative
   */
  verifyDocument: async (documentId, data) => {
    const response = await apiClient.patch(`${BASE_URL}/documents/${documentId}/verify`, data);
    return response.data.data;
  },

  // ─────────────────────── NOTES ──────────────────────────────────────────

  /**
   * Ajouter une note à un dossier
   */
  addNote: async (applicationId, data) => {
    const response = await apiClient.post(`${BASE_URL}/${applicationId}/notes`, data);
    return response.data.data;
  },

  /**
   * Récupérer les notes d'un dossier
   * @param includeInternal - true pour voir les notes internes (staff uniquement)
   */
  getNotes: async (applicationId, includeInternal = false) => {
    const response = await apiClient.get(`${BASE_URL}/${applicationId}/notes`, {
      params: { includeInternal },
    });
    return response.data.data;
  },
};
