import { apiClient } from './api-client'
import { extractList, extractItem } from './api-helpers'

export const admissionsService = {
  /**
   * Create a new admission application
   */
  async createApplication(data) {
    const res = await apiClient.post('/admissions', data)
    return extractItem(res.data)
  },

  /**
   * List applications with filters (page, size, status, programId, academicYearId)
   */
  async getAll(params = {}) {
    const res = await apiClient.get('/admissions', { params })
    return extractList(res.data)
  },

  /**
   * Get detail of an application
   */
  async getById(id) {
    const res = await apiClient.get(`/admissions/${id}`)
    return extractItem(res.data)
  },

  /**
   * Change status of an application
   */
  async updateStatus(id, status, reason = '') {
    const res = await apiClient.patch(`/admissions/${id}/status`, { status, reason })
    return extractItem(res.data)
  },

  /**
   * Upload missing documents for an admission
   */
  async uploadDocument(id, formData) {
    const res = await apiClient.post(`/admissions/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return extractItem(res.data)
  },

  /**
   * List documents for an admission
   */
  async getDocuments(id) {
    const res = await apiClient.get(`/admissions/${id}/documents`)
    return extractList(res.data)
  },

  /**
   * Add internal note
   */
  async addNote(id, content) {
    const res = await apiClient.post(`/admissions/${id}/notes`, { content })
    return extractItem(res.data)
  }
}
