import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const analyticsService = {
  /**
   * Get all open alerts
   */
  async getOpenAlerts(params = {}) {
    const res = await apiClient.get('/v1/analytics/alerts', { params: { status: 'OPEN', ...params } })
    return extractList(res.data)
  },

  /**
   * Get open alert count (for badge)
   */
  async getOpenAlertCount() {
    const res = await apiClient.get('/v1/analytics/alerts/count-open')
    return extractItem(res.data)
  },

  /**
   * Get alerts for a specific student
   */
  async getStudentAlerts(studentId) {
    const res = await apiClient.get(`/v1/analytics/alerts/students/${studentId}`)
    return extractList(res.data)
  },

  /**
   * Get analytics snapshots for a student
   */
  async getStudentSnapshots(studentId) {
    const res = await apiClient.get(`/v1/analytics/snapshots/students/${studentId}`)
    return extractList(res.data)
  },

  /**
   * Get risk ranking for a cohort
   */
  async getCohortRiskRanking(cohortId) {
    const res = await apiClient.get(`/v1/analytics/snapshots/cohorts/${cohortId}/risk-ranking`)
    return extractList(res.data)
  },

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId) {
    const res = await apiClient.patch(`/v1/analytics/alerts/${alertId}/acknowledge`)
    return extractItem(res.data)
  },

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId) {
    const res = await apiClient.patch(`/v1/analytics/alerts/${alertId}/resolve`)
    return extractItem(res.data)
  },
}
