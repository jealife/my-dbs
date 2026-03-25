import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const careerService = {
  /**
   * Get active job offers
   */
  async getOffers(params = {}) {
    const res = await apiClient.get('/career/offers', { params })
    return extractList(res.data)
  },

  /**
   * Get a student's applications
   */
  async getStudentApplications(studentId) {
    const res = await apiClient.get(`/career/students/${studentId}/applications`)
    return extractList(res.data)
  },

  /**
   * Apply to a job offer
   */
  async applyToOffer(offerId) {
    const res = await apiClient.post(`/career/offers/${offerId}/apply`)
    return extractItem(res.data)
  },

  /**
   * Get student portfolio
   */
  async getPortfolio(studentId) {
    const res = await apiClient.get(`/career/portfolio/students/${studentId}`)
    return extractList(res.data)
  },

  /**
   * Add a portfolio project
   */
  async addPortfolioProject(data) {
    const res = await apiClient.post('/career/portfolio', data)
    return extractItem(res.data)
  },

  /**
   * Close an offer (admin)
   */
  async closeOffer(offerId) {
    const res = await apiClient.patch(`/career/offers/${offerId}/close`)
    return extractItem(res.data)
  },

  /**
   * Create a new offer (admin)
   */
  async createOffer(data) {
    const res = await apiClient.post('/career/offers', data)
    return extractItem(res.data)
  },
}
