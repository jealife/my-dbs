import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const attendanceService = {
  /**
   * Get attendance history for a student
   */
  async getStudentAttendance(studentId, params = {}) {
    const res = await apiClient.get(`/v1/attendance/students/${studentId}`, { params })
    return extractList(res.data)
  },

  /**
   * Get global attendance stats for a student
   */
  async getStudentStats(studentId) {
    const res = await apiClient.get(`/v1/attendance/stats/students/${studentId}`)
    return extractItem(res.data)
  },

  /**
   * Get attendance stats per course for a student
   */
  async getStudentStatsByCourse(studentId, courseId) {
    const res = await apiClient.get(`/v1/attendance/stats/students/${studentId}/courses/${courseId}`)
    return extractItem(res.data)
  },

  /**
   * Get attendance sheet for a session  
   */
  async getSessionSheet(sessionId) {
    const res = await apiClient.get(`/v1/attendance/sessions/${sessionId}`)
    return extractList(res.data)
  },

  /**
   * Submit bulk attendance (teacher)
   */
  async submitBulk(sessionId, entries) {
    const res = await apiClient.post('/v1/attendance/bulk', { sessionId, entries })
    return extractItem(res.data)
  },

  /**
   * Submit a justification for absence
   */
  async submitJustification(formData) {
    const res = await apiClient.post('/v1/attendance/justifications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return extractItem(res.data)
  },

  /**
   * Get justifications for a student
   */
  async getStudentJustifications(studentId) {
    const res = await apiClient.get(`/v1/attendance/justifications/students/${studentId}`)
    return extractList(res.data)
  },

  /**
   * Get pending justifications (admin / pedagogical manager)
   */
  async getPendingJustifications() {
    const res = await apiClient.get('/v1/attendance/justifications/pending')
    return extractList(res.data)
  },

  /**
   * Review a justification (approve or reject)
   * decision: APPROVED | REJECTED
   */
  async reviewJustification(id, decision, comment = '') {
    const res = await apiClient.patch(`/v1/attendance/justifications/${id}/review`, null, {
      params: { decision, comment }
    })
    return extractItem(res.data)
  },

  /**
   * Mark attendance for a single student in a session
   */
  async markSingle(sessionId, studentId, status, teacherNote = '') {
    const res = await apiClient.post(`/v1/attendance/sessions/${sessionId}`, null, {
      params: { studentId, status, teacherNote }
    })
    return extractItem(res.data)
  },

  /**
   * Correct an attendance record status
   */
  async correctRecord(recordId, status, teacherNote = '') {
    const res = await apiClient.patch(`/v1/attendance/records/${recordId}`, null, {
      params: { status, teacherNote }
    })
    return extractItem(res.data)
  },
}
