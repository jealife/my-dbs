import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const documentsService = {
  /**
   * Get documents belonging to a user/owner
   */
  async getOwnerDocuments(ownerId) {
    const res = await apiClient.get(`/v1/documents/owner/${ownerId}`)
    return extractList(res.data)
  },

  /**
   * Search documents (keyword, type, ownerId)
   */
  async search(params) {
    const res = await apiClient.get('/v1/documents/search', { params })
    return extractList(res.data)
  },

  /**
   * Get documents by reference entity
   */
  async getByReference(referenceType, referenceId) {
    const res = await apiClient.get('/v1/documents/reference', { params: { referenceType, referenceId } })
    return extractList(res.data)
  },

  /**
   * Get current version metadata for a document (returns DocumentVersion with filePath, mimeType, etc.)
   * Backend requires userId for audit trail logging.
   */
  async getDocumentVersion(documentId, userId) {
    const res = await apiClient.get(`/v1/documents/${documentId}/download`, {
      params: { userId },
    })
    return extractItem(res.data)
  },

  /**
   * Returns the public file-serving URL for a given filePath from DocumentVersion.
   * The backend exposes /api/course-resources/download-by-path with permitAll.
   */
  getFileUrl(filePath) {
    return `/api/course-resources/download-by-path?path=${encodeURIComponent(filePath)}`
  },

  /**
   * Download document as a Blob — two-step:
   *   1. GET /v1/documents/{id}/download?userId={userId} → DocumentVersion (JSON with filePath)
   *   2. GET /course-resources/download-by-path?path={filePath} → raw file bytes (public, no auth)
   * Returns { blob, version, fileUrl } so the caller can create an objectURL and a direct link.
   */
  async getDownloadBlob(documentId, userId) {
    const version = await this.getDocumentVersion(documentId, userId)
    const res = await apiClient.get('/course-resources/download-by-path', {
      params: { path: version.filePath },
      responseType: 'blob',
    })
    return {
      blob: res.data,
      version,
      fileUrl: this.getFileUrl(version.filePath),
    }
  },

  /**
   * Upload a new document (multipart).
   * Backend requires: file, title (mandatory), documentType, ownerId, accessLevel (default MANAGER).
   */
  async upload(formData) {
    const res = await apiClient.post('/v1/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return extractItem(res.data)
  },

  /**
   * Upload a new version of an existing document
   */
  async uploadVersion(documentId, formData) {
    const res = await apiClient.post(`/v1/documents/${documentId}/versions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return extractItem(res.data)
  },

  /**
   * Get version history of a document.
   * Backend requires userId for access control.
   */
  async getVersions(documentId, userId) {
    const res = await apiClient.get(`/v1/documents/${documentId}/versions`, {
      params: { userId },
    })
    return extractList(res.data)
  },

  /**
   * Soft-delete a document (ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER).
   * Backend requires userId for audit trail.
   */
  async deleteDocument(documentId, userId) {
    await apiClient.delete(`/v1/documents/${documentId}`, {
      params: { userId },
    })
  },

  /**
   * Get document audit trail (ADMIN, SCHOOL_MANAGER)
   */
  async getAudit(documentId) {
    const res = await apiClient.get(`/v1/documents/${documentId}/audit`)
    return extractList(res.data)
  },
}
