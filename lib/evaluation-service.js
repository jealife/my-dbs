import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const evaluationService = {
  /**
   * List evaluations (optionally filtered)
   */
  async getAll(params = {}) {
    const res = await apiClient.get('/evaluations', { params })
    return extractList(res.data)
  },

  /**
   * Get a single evaluation
   */
  async getById(id) {
    const res = await apiClient.get(`/evaluations/${id}`)
    return extractItem(res.data)
  },

  /**
   * Get student results for an evaluation
   */
  async getStudentResult(evaluationId, studentId) {
    const res = await apiClient.get(`/evaluations/${evaluationId}/grades/student/${studentId}`)
    return extractItem(res.data)
  },

  /**
   * Get all published results for a student
   */
  async getMyResults(studentId) {
    const res = await apiClient.get(`/evaluations/my-results/student/${studentId}`)
    return extractList(res.data)
  },

  /**
   * Create a new evaluation 
   */
  async createEvaluation(data) {
    const res = await apiClient.post('/evaluations', data)
    return extractItem(res.data)
  },

  /**
   * Submit grades for a student
   */
  async submitGrade(evaluationId, gradeData) {
    const res = await apiClient.post(`/evaluations/${evaluationId}/grades`, gradeData)
    return extractItem(res.data)
  },
}

export const assignmentService = {
  /**
   * List all assignments (optionally filtered)
   */
  async getAll(params = {}) {
    const res = await apiClient.get('/assignments', { params })
    return extractList(res.data)
  },

  /**
   * Get assignment detail
   */
  async getById(id) {
    const res = await apiClient.get(`/assignments/${id}`)
    return extractItem(res.data)
  },

  /**
   * Submit a student assignment
   */
  async submit(assignmentId, formData) {
    const res = await apiClient.post(`/assignments/${assignmentId}/submissions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return extractItem(res.data)
  },

  /**
   * Get all submissions for an assignment (teacher/admin)
   */
  async getSubmissions(assignmentId) {
    const res = await apiClient.get(`/assignments/${assignmentId}/submissions`)
    return extractList(res.data)
  },
}
