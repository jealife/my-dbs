import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

/**
 * Competences & Badges service — backend base : /api/v1/competences
 * M13 — Niveaux : BEGINNER | INTERMEDIATE | ADVANCED | EXPERT
 */
export const competencesService = {
  /**
   * Get all competences (referentiel)
   */
  async getAll(params = {}) {
    const res = await apiClient.get('/v1/competences', { params })
    return extractList(res.data)
  },

  /**
   * Get competences for a specific program
   */
  async getByProgram(programId) {
    const res = await apiClient.get(`/v1/competences/programs/${programId}`)
    return extractList(res.data)
  },

  /**
   * Create a new competence (admin/pedagogical_manager)
   */
  async create(data) {
    const res = await apiClient.post('/v1/competences', data)
    return extractItem(res.data)
  },

  /**
   * Archive a competence (soft delete)
   */
  async archive(id) {
    const res = await apiClient.delete(`/v1/competences/${id}`)
    return extractItem(res.data)
  },

  /**
   * Record a competence acquisition for a student (badge auto if >= 5)
   */
  async recordAcquisition(data) {
    const res = await apiClient.post('/v1/competences/acquisitions', data)
    return extractItem(res.data)
  },

  /**
   * Get a student's competence portfolio
   */
  async getStudentPortfolio(studentId) {
    const res = await apiClient.get(`/v1/competences/students/${studentId}/portfolio`)
    return extractList(res.data)
  },

  /**
   * Get all badges (catalogue)
   */
  async getBadges() {
    const res = await apiClient.get('/v1/competences/badges')
    return extractList(res.data)
  },

  /**
   * Create a badge (admin/pedagogical_manager)
   */
  async createBadge(data) {
    const res = await apiClient.post('/v1/competences/badges', data)
    return extractItem(res.data)
  },

  /**
   * Award a badge manually to a student
   */
  async awardBadge(badgeId, data) {
    const res = await apiClient.post(`/v1/competences/badges/${badgeId}/award`, data)
    return extractItem(res.data)
  },

  /**
   * Get badges for a student
   */
  async getStudentBadges(studentId) {
    const res = await apiClient.get(`/v1/competences/students/${studentId}/badges`)
    return extractList(res.data)
  },
}
