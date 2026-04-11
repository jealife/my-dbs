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

  // --- ClassRooms ---
  async getClasses(params = {}) {
    const res = await apiClient.get('/classes', { params })
    const d = res.data?.data ?? res.data
    return Array.isArray(d) ? d : (d?.content ?? [])
  },

  async getClassesByProgram(programId) {
    // Try filtering by programId first, fallback to fetching all and filtering client-side
    try {
      const res = await apiClient.get('/classes', { params: { programId } })
      const d = res.data?.data ?? res.data
      const list = Array.isArray(d) ? d : (d?.content ?? [])
      return list.filter(c => !programId || c.programId == programId)
    } catch {
      const all = await this.getClasses()
      return all.filter(c => c.programId == programId)
    }
  },

  async createClass(data) {
    const res = await apiClient.post('/classes', data)
    return res.data?.data ?? res.data
  },

  async updateClassCapacity(id, capacity) {
    const res = await apiClient.patch(`/classes/${id}/capacity`, null, { params: { value: capacity } })
    return res.data?.data ?? res.data
  },

  async getGlobalCapacity() {
    const res = await apiClient.get('/classes/default-capacity')
    return res.data?.data ?? res.data
  },

  async updateGlobalCapacity(capacity, applyToAll = false) {
    const res = await apiClient.patch('/classes/global-capacity', null, { params: { value: capacity, applyToAll } })
    return res.data?.data ?? res.data
  },

  // --- Students by program (from admissions) ---
  async getStudentsByProgram(programId) {
    try {
      const res = await apiClient.get('/v1/admissions', { params: { programId, status: 'ENROLLED' } })
      const d = res.data?.data ?? res.data
      const list = Array.isArray(d) ? d : (d?.content ?? [])
      return list
    } catch {
      // Fallback: try students endpoint
      try {
        const res = await apiClient.get('/students', { params: { programId } })
        const d = res.data?.data ?? res.data
        return Array.isArray(d) ? d : (d?.content ?? [])
      } catch {
        return []
      }
    }
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

