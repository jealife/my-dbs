import { apiClient } from '@/lib/api-client'

export const examService = {
  // --- Exam Catalog ---
  async getExams(params = {}) {
    return apiClient.get('/exams', { params })
  },
  
  async getExamById(id) {
    return apiClient.get(`/exams/${id}`)
  },

  // --- Submissions & Results ---
  async getResults(studentCode) {
    return apiClient.get(`/exams/results/${studentCode}`)
  },

  async submitExam(id, data) {
    return apiClient.post(`/exams/${id}/submit`, data)
  },

  // --- Teacher Actions ---
  async createExam(data) {
    return apiClient.post('/exams', data)
  }
}
