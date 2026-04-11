import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const teachingUnitService = {
  /**
   * Get all UEs, optionally filtered by program and/or semester
   */
  async getAll(params = {}) {
    const res = await apiClient.get('/v1/teaching-units', { params })
    return extractList(res.data)
  },

  async getByProgram(programId) {
    const res = await apiClient.get('/v1/teaching-units', { params: { programId } })
    return extractList(res.data)
  },

  async getByProgramAndSemester(programId, semester) {
    const res = await apiClient.get('/v1/teaching-units', { params: { programId, semester } })
    return extractList(res.data)
  },

  async getById(id) {
    const res = await apiClient.get(`/v1/teaching-units/${id}`)
    return extractItem(res.data)
  },

  async create(data) {
    const res = await apiClient.post('/v1/teaching-units', data)
    return extractItem(res.data)
  },

  async update(id, data) {
    const res = await apiClient.put(`/v1/teaching-units/${id}`, data)
    return extractItem(res.data)
  },

  async delete(id) {
    const res = await apiClient.delete(`/v1/teaching-units/${id}`)
    return res.data
  },
}
