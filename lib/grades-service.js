import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const gradesService = {
  /**
   * Get grade books for a student
   */
  async getStudentGradeBooks(studentId, params = {}) {
    // Backend requires academicYearId
    const queryParams = { academicYearId: 1, ...params }
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
    // Backend requires academicYearId and semester
    const queryParams = { academicYearId: 1, semester: 'S1', ...params }
    const res = await apiClient.get(`/v1/grades/bulletins/students/${studentId}`, { params: queryParams })
    return extractItem(res.data)
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
}
