import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

/**
 * Career service — backend base : /api/v1/career
 * NOTE: All POST/PATCH endpoints use @RequestParam (query params), NOT JSON body.
 */
export const careerService = {
  /**
   * Get active job offers (backend filters OPEN + not expired internally)
   * Supports optional: type, keyword
   */
  async getOffers(params = {}) {
    const res = await apiClient.get('/v1/career/offers', { params })
    return extractList(res.data)
  },

  /**
   * Get applications for a specific offer (admin)
   */
  async getOfferApplications(offerId) {
    const res = await apiClient.get(`/v1/career/offers/${offerId}/applications`)
    return extractList(res.data)
  },

  /**
   * Get a student's applications
   */
  async getStudentApplications(studentId) {
    const res = await apiClient.get(`/v1/career/students/${studentId}/applications`)
    return extractList(res.data)
  },

  /**
   * Apply to a job offer.
   * Backend: @RequestParam Long studentId (mandatory)
   */
  async applyToOffer(offerId, studentId) {
    const res = await apiClient.post(
      `/v1/career/offers/${offerId}/apply`,
      null,
      { params: { studentId } }
    )
    return extractItem(res.data)
  },

  /**
   * Update application status (admin)
   * Backend: @RequestParam String status
   */
  async updateApplicationStatus(appId, status) {
    const res = await apiClient.patch(
      `/v1/career/applications/${appId}/status`,
      null,
      { params: { status } }
    )
    return extractItem(res.data)
  },

  /**
   * Get student portfolio
   */
  async getPortfolio(studentId) {
    const res = await apiClient.get(`/v1/career/portfolio/students/${studentId}`)
    return extractList(res.data)
  },

  /**
   * Get portfolio showcase (public)
   */
  async getPortfolioShowcase(params = {}) {
    const res = await apiClient.get('/v1/career/portfolio/showcase', { params })
    return extractList(res.data)
  },

  /**
   * Add a portfolio project.
   * Backend: @RequestParam studentId, title, description?, projectUrl?,
   *   repositoryUrl?, technologies?, startDate?, endDate?, publiclyVisible, courseId?
   */
  async addPortfolioProject(params) {
    const res = await apiClient.post('/v1/career/portfolio', null, { params })
    return extractItem(res.data)
  },

  /**
   * Close an offer (admin)
   */
  async closeOffer(offerId) {
    const res = await apiClient.patch(`/v1/career/offers/${offerId}/close`)
    return extractItem(res.data)
  },

  /**
   * Create a new offer (admin).
   * Backend: @RequestParam postedById, title, company, description, offerType,
   *   location?, remote?, deadline?, startDate?, durationMonths?, contactEmail?, programIds?
   */
  async createOffer(params) {
    const res = await apiClient.post('/v1/career/offers', null, { params })
    return extractItem(res.data)
  },
}
