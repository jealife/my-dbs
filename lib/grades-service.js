import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const gradesService = {
  /**
   * Get grade books for a student
   */
  async getStudentGradeBooks(studentId, params = {}) {
    // academicYearId is optional — backend returns all years if omitted
    const queryParams = { ...params }
    const res = await apiClient.get(`/v1/grades/grade-books/students/${studentId}`, { params: queryParams })
    return extractList(res.data)
  },

  /**
   * Get grade book (single)
   */
  async getGradeBook(params = {}) {
    const res = await apiClient.get('/v1/grades/grade-books', { params })
    return extractList(res.data)
  },

  /**
   * Get bulletin for a student
   */
  async getStudentBulletin(studentId, params = {}) {
    // academicYearId and semester are optional filters
    // Return null silently when no bulletin exists yet (404)
    try {
      const res = await apiClient.get(`/v1/grades/bulletins/students/${studentId}`, { params })
      return extractItem(res.data)
    } catch (err) {
      if (err?.response?.status === 404) return null
      throw err
    }
  },

  /**
   * Get all bulletins for a cohort
   */
  async getCohortBulletins(cohortId, params = {}) {
    const res = await apiClient.get(`/v1/grades/bulletins/cohorts/${cohortId}`, { params })
    return extractList(res.data)
  },

  /**
   * Generate a bulletin (admin/pedagogical manager)
   */
  async generateBulletin(studentId, academicYearId, semester) {
    const res = await apiClient.post('/v1/grades/bulletins/generate', null, {
      params: { studentId, academicYearId, semester }
    })
    return extractItem(res.data)
  },

  /**
   * Publish a bulletin
   */
  async publishBulletin(bulletinId, comment = '') {
    const res = await apiClient.patch(`/v1/grades/bulletins/${bulletinId}/publish`, null, {
      params: { comment }
    })
    return extractItem(res.data)
  },

  /**
   * Set teacher appreciation on a grade book
   */
  async setAppreciation(gradeBookId, appreciation) {
    const res = await apiClient.patch(`/v1/grades/grade-books/${gradeBookId}/appreciation`, null, {
      params: { appreciation }
    })
    return extractItem(res.data)
  },

  /**
   * Add a grade item (triggers average recalculation)
   * data: { gradeBookId, label, score, maxScore, evaluationType, date }
   */
  async addGradeItem(data) {
    const res = await apiClient.post('/v1/grades/grade-items', data)
    return extractItem(res.data)
  },

  /**
   * Delete a grade item (triggers average recalculation)
   */
  async deleteGradeItem(itemId) {
    await apiClient.delete(`/v1/grades/grade-items/${itemId}`)
  },

  /**
   * Record acquired ECTS credits for a student
   */
  async recordCredits(data) {
    const res = await apiClient.post('/v1/grades/credits', data)
    return extractItem(res.data)
  },

  /**
   * Download bulletin as PDF — M15 : GET /api/v1/pdf/bulletins/{bulletinId}
   * Returns a Blob
   */
  async downloadBulletinPdf(bulletinId) {
    const res = await apiClient.get(`/v1/pdf/bulletins/${bulletinId}`, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    })
    return res.data
  },

  /**
   * Download transcript as PDF — M15 : GET /api/v1/pdf/transcripts/{studentId}
   * Returns a Blob
   */
  async downloadTranscriptPdf(studentId, academicYearId) {
    const res = await apiClient.get(`/v1/pdf/transcripts/${studentId}`, {
      params: academicYearId ? { academicYearId } : {},
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    })
    return res.data
  },

  /**
   * Get all bulletins for a student (all semesters)
   */
  async getAllStudentBulletins(studentId, academicYearId) {
    const semesters = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']
    const results = []
    for (const semester of semesters) {
      try {
        const bulletin = await this.getStudentBulletin(studentId, { academicYearId, semester })
        if (bulletin) results.push(bulletin)
      } catch {
        // bulletin inexistant pour ce semestre — on ignore
      }
    }
    return results
  },
}
