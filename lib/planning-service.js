import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const planningService = {
  /**
   * Get personal agenda
   */
  async getMyAgenda(userId, from, to) {
    const res = await apiClient.get('/planning/agenda', { params: { userId, from, to } })
    return extractList(res.data)
  },

  /**
   * Get cohort agenda
   */
  async getCohortAgenda(cohortId, from, to) {
    const res = await apiClient.get(`/planning/cohorts/${cohortId}/agenda`, { params: { from, to } })
    return extractList(res.data)
  },

  /**
   * Create a schedule event
   */
  async createEvent(params) {
    const res = await apiClient.post('/planning/events', null, { params })
    return extractItem(res.data)
  },

  /**
   * Update a schedule event
   */
  async updateEvent(id, params) {
    const res = await apiClient.put(`/planning/events/${id}`, null, { params })
    return extractItem(res.data)
  },

  /**
   * Cancel an event
   */
  async cancelEvent(id, reason) {
    const res = await apiClient.post(`/planning/events/${id}/cancel`, null, { params: { reason } })
    return extractItem(res.data)
  },
}
