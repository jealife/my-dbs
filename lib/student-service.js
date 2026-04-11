import { apiClient } from '@/lib/api-client'

export const studentService = {
  // --- Students Directory ---
  async getAllStudents(params = {}) {
    return apiClient.get('/students', { params })
  },
  
  async getStudentByCode(code) {
    return apiClient.get(`/students/${code}`)
  },

  // --- Admissions ---
  async getAdmissions(status = 'PENDING') {
    return apiClient.get('/admissions', { params: { status } })
  },

  async processAdmission(id, action) {
    // action: 'APPROVE' or 'REJECT'
    return apiClient.post(`/admissions/${id}/process`, { action })
  }
}
