import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const documentsService = {
  /**
   * Get documents belonging to a user/owner
   */
  async getOwnerDocuments(ownerId) {
    const res = await apiClient.get(`/documents/owner/${ownerId}`)
    return extractList(res.data)
  },

  /**
   * Search documents
   */
  async search(params) {
    const res = await apiClient.get('/documents/search', { params })
    return extractList(res.data)
  },

  /**
   * Download a document
   */
  getDownloadUrl(documentId) {
    return `/api/v1/documents/${documentId}/download`
  },

  /**
   * Upload a document
   */
  async upload(formData) {
    const res = await apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return extractItem(res.data)
  },

  /**
   * Soft-delete a document (admin)
   */
  async deleteDocument(documentId) {
    await apiClient.delete(`/documents/${documentId}`)
  },

  /**
   * Get document audit trail
   */
  async getAudit(documentId) {
    const res = await apiClient.get(`/documents/${documentId}/audit`)
    return extractList(res.data)
  },

  /**
   * Get documents by reference entity
   */
  async getByReference(referenceType, referenceId) {
    const res = await apiClient.get('/documents/reference', { params: { referenceType, referenceId } })
    return extractList(res.data)
  },
}
