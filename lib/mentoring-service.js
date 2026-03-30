import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const mentoringService = {
  /**
   * Get mentorships for a mentee
   */
  async getMenteeMentorships(menteeId) {
    const res = await apiClient.get(`/mentoring/mentees/${menteeId}`)
    return extractList(res.data)
  },

  /**
   * Get mentorships managed by a mentor
   */
  async getMentorMentorships(mentorId) {
    const res = await apiClient.get(`/mentoring/mentors/${mentorId}`)
    return extractList(res.data)
  },

  /**
   * Get sessions for a mentorship
   */
  async getSessions(mentorshipId) {
    const res = await apiClient.get(`/mentoring/${mentorshipId}/sessions`)
    return extractList(res.data)
  },

  /**
   * Plan a new mentoring session
   */
  async planSession(mentorshipId, sessionData) {
    const res = await apiClient.post(`/mentoring/${mentorshipId}/sessions`, sessionData)
    return extractItem(res.data)
  },

  /**
   * Update session status
   */
  async updateSessionStatus(sessionId, status, notes = '') {
    const res = await apiClient.patch(`/mentoring/sessions/${sessionId}/status`, null, {
      params: { status, notes }
    })
    return extractItem(res.data)
  },

  /**
   * Get action plans for a mentorship
   */
  async getActionPlans(mentorshipId) {
    const res = await apiClient.get(`/mentoring/${mentorshipId}/action-plans`)
    return extractList(res.data)
  },

  /**
   * Create an action plan
   */
  async createActionPlan(mentorshipId, planData) {
    const res = await apiClient.post(`/mentoring/${mentorshipId}/action-plans`, planData)
    return extractItem(res.data)
  },
}
