import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const mentoringService = {
  /**
   * Create a mentoring relationship (ADMIN, PEDAGOGICAL_MANAGER)
   * data: { mentorId, menteeId, startDate?, notes? }
   */
  async create(data) {
    const res = await apiClient.post('/v1/mentoring', data)
    return extractItem(res.data)
  },

  /**
   * Change mentorship status
   * status: ACTIVE | COMPLETED | CANCELLED
   */
  async updateStatus(id, status) {
    const res = await apiClient.patch(`/v1/mentoring/${id}/status`, null, {
      params: { status }
    })
    return extractItem(res.data)
  },

  /**
   * Get mentorships for a mentee
   */
  async getMenteeMentorships(menteeId) {
    const res = await apiClient.get(`/v1/mentoring/mentees/${menteeId}`)
    return extractList(res.data)
  },

  /**
   * Get mentorships managed by a mentor
   */
  async getMentorMentorships(mentorId) {
    const res = await apiClient.get(`/v1/mentoring/mentors/${mentorId}`)
    return extractList(res.data)
  },

  /**
   * Get sessions for a mentorship
   */
  async getSessions(mentorshipId) {
    const res = await apiClient.get(`/v1/mentoring/${mentorshipId}/sessions`)
    return extractList(res.data)
  },

  /**
   * Plan a new mentoring session
   */
  async planSession(mentorshipId, sessionData) {
    const res = await apiClient.post(`/v1/mentoring/${mentorshipId}/sessions`, sessionData)
    return extractItem(res.data)
  },

  /**
   * Update session status
   */
  async updateSessionStatus(sessionId, status, notes = '') {
    const res = await apiClient.patch(`/v1/mentoring/sessions/${sessionId}/status`, null, {
      params: { status, notes }
    })
    return extractItem(res.data)
  },

  /**
   * Get action plans for a mentorship
   */
  async getActionPlans(mentorshipId) {
    const res = await apiClient.get(`/v1/mentoring/${mentorshipId}/action-plans`)
    return extractList(res.data)
  },

  /**
   * Create an action plan
   */
  async createActionPlan(mentorshipId, planData) {
    const res = await apiClient.post(`/v1/mentoring/${mentorshipId}/action-plans`, planData)
    return extractItem(res.data)
  },

  /**
   * Complete / check off an action plan item
   */
  async completeActionPlan(planId) {
    const res = await apiClient.patch(`/v1/mentoring/action-plans/${planId}/complete`)
    return extractItem(res.data)
  },
}
