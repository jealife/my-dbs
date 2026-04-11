import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const evaluationService = {
  /**
   * List evaluations (optionally filtered)
   */
  async getAll(params = {}) {
    const res = await apiClient.get('/v1/evaluations', { params })
    return extractList(res.data)
  },

  /**
   * Get a single evaluation
   */
  async getById(id) {
    const res = await apiClient.get(`/v1/evaluations/${id}`)
    return extractItem(res.data)
  },

  /**
   * Get all grades for an evaluation
   */
  async getGrades(evaluationId) {
    const res = await apiClient.get(`/v1/evaluations/${evaluationId}/grades`)
    return extractList(res.data)
  },

  /**
   * Get student results for an evaluation
   */
  async getStudentResult(evaluationId, studentId) {
    const res = await apiClient.get(`/v1/evaluations/${evaluationId}/grades/student/${studentId}`)
    return extractItem(res.data)
  },

  /**
   * Get all published results for a student
   */
  async getMyResults(studentId) {
    const res = await apiClient.get(`/v1/evaluations/my-results/student/${studentId}`)
    return extractList(res.data)
  },

  /**
   * Create a new evaluation 
   */
  async createEvaluation(data) {
    const res = await apiClient.post('/v1/evaluations', data)
    return extractItem(res.data)
  },

  /**
   * Submit grades for a student
   */
  async submitGrade(evaluationId, gradeData) {
    const res = await apiClient.post(`/v1/evaluations/${evaluationId}/grades`, gradeData)
    return extractItem(res.data)
  },

  /**
   * Correct a grade before publication
   */
  async updateGrade(resultId, gradeData) {
    const res = await apiClient.patch(`/v1/evaluations/grades/${resultId}`, gradeData)
    return extractItem(res.data)
  },

  /**
   * Change evaluation status
   * targetStatus: DRAFT | SCHEDULED | IN_PROGRESS | CLOSED | RESULTS_PUBLISHED
   */
  async updateStatus(id, targetStatus) {
    const res = await apiClient.patch(`/v1/evaluations/${id}/status`, null, {
      params: { targetStatus }
    })
    return extractItem(res.data)
  },

  /**
   * Publish results for an evaluation
   */
  async publish(evaluationId) {
    const res = await apiClient.post(`/v1/evaluations/${evaluationId}/publish`)
    return extractItem(res.data)
  },

  /**
   * Add rubric criterion
   */
  async addRubricCriterion(evaluationId, criterionData) {
    const res = await apiClient.post(`/v1/evaluations/${evaluationId}/rubric`, criterionData)
    return extractItem(res.data)
  },

  /**
   * Get rubric for an evaluation
   */
  async getRubric(evaluationId) {
    const res = await apiClient.get(`/v1/evaluations/${evaluationId}/rubric`)
    return extractList(res.data)
  },

  /**
   * Create deliberation session
   */
  async createDeliberation(data) {
    const res = await apiClient.post('/v1/evaluations/deliberations', data)
    return extractItem(res.data)
  },

  /**
   * List deliberations
   */
  async getDeliberations(params = {}) {
    const res = await apiClient.get('/v1/evaluations/deliberations', { params })
    return extractList(res.data)
  },

  /**
   * Publish deliberation
   */
  async publishDeliberation(id) {
    const res = await apiClient.post(`/v1/evaluations/deliberations/${id}/publish`)
    return extractItem(res.data)
  },
}

export const assignmentService = {
  /**
   * List all assignments (optionally filtered)
   */
  async getAll(params = {}) {
    const res = await apiClient.get('/v1/assignments', { params })
    return extractList(res.data)
  },

  /**
   * Get assignment detail
   */
  async getById(id) {
    const res = await apiClient.get(`/v1/assignments/${id}`)
    return extractItem(res.data)
  },

  /**
   * Submit a student assignment
   */
  async submit(assignmentId, formData) {
    const res = await apiClient.post(`/v1/assignments/${assignmentId}/submissions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return extractItem(res.data)
  },

  /**
   * Get all submissions for an assignment (teacher/admin)
   */
  async getSubmissions(assignmentId) {
    const res = await apiClient.get(`/v1/assignments/${assignmentId}/submissions`)
    return extractList(res.data)
  },

  /**
   * Get submission for a specific student
   */
  async getStudentSubmission(assignmentId, studentId) {
    const res = await apiClient.get(`/v1/assignments/${assignmentId}/submissions/student/${studentId}`)
    return extractItem(res.data)
  },

  /**
   * Publish assignment (visible to students)
   */
  async publish(id) {
    const res = await apiClient.patch(`/v1/assignments/${id}/publish`)
    return extractItem(res.data)
  },

  /**
   * Publish assignment results
   */
  async publishResults(id) {
    const res = await apiClient.patch(`/v1/assignments/${id}/publish-results`)
    return extractItem(res.data)
  },

  /**
   * Grade a submission (score + feedback)
   */
  async gradeSubmission(submissionId, score, feedback = '') {
    const res = await apiClient.patch(`/v1/assignments/submissions/${submissionId}/grade`, null, {
      params: { score, feedback }
    })
    return extractItem(res.data)
  },

  /**
   * Return corrected submission to student
   */
  async returnSubmission(submissionId) {
    const res = await apiClient.patch(`/v1/assignments/submissions/${submissionId}/return`)
    return extractItem(res.data)
  },

  /**
   * Start a quiz attempt (student)
   */
  async startQuiz(assignmentId, studentId) {
    const res = await apiClient.post(`/v1/assignments/${assignmentId}/quiz/start`, null, {
      params: { studentId }
    })
    return extractItem(res.data)
  },

  /**
   * Submit quiz attempt answers (auto-graded QCM)
   */
  async submitQuizAttempt(attemptId, answers) {
    const res = await apiClient.post(`/v1/assignments/quiz/attempts/${attemptId}/submit`, answers)
    return extractItem(res.data)
  },

  /**
   * Get quiz attempt history for a student
   */
  async getStudentAttempts(assignmentId, studentId) {
    const res = await apiClient.get(`/v1/assignments/${assignmentId}/quiz/attempts/student/${studentId}`)
    return extractList(res.data)
  },
}
