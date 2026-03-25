import { apiClient } from '@/lib/api-client'

export const academicService = {
  // --- Levels ---
  async getLevels() {
    return apiClient.get('/academic/levels')
  },
  
  async getLevelById(id) {
    return apiClient.get(`/academic/levels/${id}`)
  },

  // --- Specialized Sectors / Areas ---
  async getSectors() {
    return apiClient.get('/academic/sectors')
  },

  // --- Academic Structure (Combined) ---
  async getFullStructure() {
    return apiClient.get('/academic/structure')
  },

  // --- Periods (Semesters/Trimesters) ---
  async getPeriods() {
    return apiClient.get('/academic/periods')
  }
}
