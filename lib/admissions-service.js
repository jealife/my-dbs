import { apiClient } from './api-client'
import { extractList, extractItem } from './api-helpers'

export const admissionsService = {
  /**
   * Create a new admission application
   */
  async createApplication(data) {
    const res = await apiClient.post('/v1/admissions', data)
    return extractItem(res.data)
  },

  /**
   * List applications with filters (page, size, status, programId, academicYearId)
   */
  async getAll(params = {}) {
    const res = await apiClient.get('/v1/admissions', { params })
    return extractList(res.data)
  },

  /**
   * Get detail of an application
   */
  async getById(id) {
    const res = await apiClient.get(`/v1/admissions/${id}`)
    return extractItem(res.data)
  },

  /**
   * Change status of an application
   */
  async updateStatus(id, status, reason = '') {
    const res = await apiClient.patch(`/v1/admissions/${id}/status`, { 
      targetStatus: status, 
      status: status, // Doublon par sécurité
      reason 
    })
    return extractItem(res.data)
  },

  /**
   * Upload missing documents for an admission
   */
  async uploadDocument(id, formData) {
    const res = await apiClient.post(`/v1/admissions/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return extractItem(res.data)
  },

  /**
   * List documents for an admission
   */
  async getDocuments(id) {
    const res = await apiClient.get(`/v1/admissions/${id}/documents`)
    return extractList(res.data)
  },

  /**
   * Add internal note
   */
  async addNote(id, content) {
    const res = await apiClient.post(`/v1/admissions/${id}/notes`, { content })
    return extractItem(res.data)
  },

  /**
   * List notes for an admission
   * includeInternal: false = notes publiques uniquement (vue candidat)
   */
  async getNotes(id, includeInternal = true) {
    const res = await apiClient.get(`/v1/admissions/${id}/notes`, {
      params: { includeInternal }
    })
    return extractList(res.data)
  },

  /**
   * Update an application (DRAFT status only)
   */
  async update(id, data) {
    const res = await apiClient.put(`/v1/admissions/${id}`, data)
    return extractItem(res.data)
  },

  /**
   * Archive (soft delete) an application (ADMIN only)
   */
  async archive(id) {
    await apiClient.delete(`/v1/admissions/${id}`)
  },

  /**
   * Verify or invalidate a document on an admission
   */
  async verifyDocument(docId, verified) {
    const res = await apiClient.patch(`/v1/admissions/documents/${docId}/verify`, null, {
      params: { verified }
    })
    return extractItem(res.data)
  },

  /**
   * Delete a document from an admission
   */
  async deleteDocument(docId) {
    await apiClient.delete(`/v1/admissions/documents/${docId}`)
  },
}
