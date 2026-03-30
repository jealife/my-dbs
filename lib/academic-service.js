import { apiClient } from '@/lib/api-client'

export const academicService = {
  // --- Academic Years ---
  async getLevels() {
    return apiClient.get('/academic-years')
  },

  async createLevel(data) {
    return apiClient.post('/academic-years', data)
  },

  async updateLevel(id, data) {
    return apiClient.put(`/academic-years/${id}`, data)
  },

  async deleteLevel(id) {
    return apiClient.delete(`/academic-years/${id}`)
  },

  // --- Programs ---
  async getSectors() {
    return apiClient.get('/programs')
  },

  async createProgram(data) {
    return apiClient.post('/programs', data)
  },

  async updateProgram(id, data) {
    return apiClient.put(`/programs/${id}`, data)
  },

  async deleteProgram(id) {
    return apiClient.delete(`/programs/${id}`)
  },

  // --- Cohorts ---
  async getCohorts() {
    return apiClient.get('/cohorts')
  },

  // --- Full Academic Structure ---
  async getFullStructure() {
    const [yearsRes, programsRes, cohortsRes] = await Promise.allSettled([
      apiClient.get('/academic-years'),
      apiClient.get('/programs'),
      apiClient.get('/cohorts'),
    ])

    const extract = (res) => {
      if (res.status !== 'fulfilled') return []
      const d = res.value.data?.data ?? res.value.data
      return Array.isArray(d) ? d : (d?.content ?? [])
    }

    return {
      data: {
        academicYears: extract(yearsRes),
        programs:      extract(programsRes),
        cohorts:       extract(cohortsRes),
      }
    }
  }
}
