import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

/**
 * Planning / Agenda service — backend base : /api/v1/planning
 */
export const planningService = {
  /**
   * Get personal agenda (userId optional, filtered by user)
   */
  async getMyAgenda(userId, from, to) {
    const res = await apiClient.get('/v1/planning/agenda', { params: { userId, from, to } })
    return extractList(res.data)
  },

  /**
   * Get cohort agenda
   */
  async getCohortAgenda(cohortId, from, to) {
    const res = await apiClient.get(`/v1/planning/cohorts/${cohortId}/agenda`, { params: { from, to } })
    return extractList(res.data)
  },

  /**
   * Get teacher available slots
   */
  async getTeacherSlots(teacherId, from, to) {
    const res = await apiClient.get(`/v1/planning/teachers/${teacherId}/slots`, { params: { from, to } })
    return extractList(res.data)
  },

  /**
   * Create a schedule event
   */
  async createEvent(params) {
    const res = await apiClient.post('/v1/planning/events', null, { params })
    return extractItem(res.data)
  },

  /**
   * Update a schedule event
   */
  async updateEvent(id, params) {
    const res = await apiClient.put(`/v1/planning/events/${id}`, null, { params })
    return extractItem(res.data)
  },

  /**
   * Cancel an event
   */
  async cancelEvent(id, reason) {
    const res = await apiClient.post(`/v1/planning/events/${id}/cancel`, null, { params: { reason } })
    return extractItem(res.data)
  },

  /**
   * Check conflicts for an event
   */
  async getConflicts(eventId) {
    const res = await apiClient.get(`/v1/planning/events/${eventId}/conflicts`)
    return extractList(res.data)
  },
}

/**
 * Alias: agenda-service was pointing at /agenda/* — rewired here for backward compat.
 */
export const agendaService = {
  async getSchedule(from, to) {
    return planningService.getMyAgenda(undefined, from, to)
  },
  async getMySessions(userId, from, to) {
    return planningService.getMyAgenda(userId, from, to)
  },
  async getSessionDetails(id) {
    // course-sessions controller: /api/course-sessions/{id}
    const res = await apiClient.get(`/course-sessions/${id}`)
    return extractItem(res.data)
  },
  async updateSessionAttendance(id, attendanceList) {
    return apiClient.post(`/course-sessions/${id}/attendance`, { attendanceList })
  },
}
