import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const attendanceService = {
  /**
   * Get attendance history for a student
   */
  async getStudentAttendance(studentId, params = {}) {
    const res = await apiClient.get(`/attendance/students/${studentId}`, { params })
    return extractList(res.data)
  },

  /**
   * Get global attendance stats for a student
   */
  async getStudentStats(studentId) {
    const res = await apiClient.get(`/attendance/stats/students/${studentId}`)
    return extractItem(res.data)
  },

  /**
   * Get attendance stats per course for a student
   */
  async getStudentStatsByCourse(studentId, courseId) {
    const res = await apiClient.get(`/attendance/stats/students/${studentId}/courses/${courseId}`)
    return extractItem(res.data)
  },

  /**
   * Get attendance sheet for a session  
   */
  async getSessionSheet(sessionId) {
    const res = await apiClient.get(`/attendance/sessions/${sessionId}`)
    return extractList(res.data)
  },

  /**
   * Submit bulk attendance (teacher)
   */
  async submitBulk(sessionId, entries) {
    const res = await apiClient.post('/attendance/bulk', { sessionId, entries })
    return extractItem(res.data)
  },

  /**
   * Submit a justification for absence
   */
  async submitJustification(formData) {
    const res = await apiClient.post('/attendance/justifications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return extractItem(res.data)
  },

  /**
   * Get justifications for a student
   */
  async getStudentJustifications(studentId) {
    const res = await apiClient.get(`/attendance/justifications/students/${studentId}`)
    return extractList(res.data)
  },
}
