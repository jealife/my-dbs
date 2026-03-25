import { apiClient } from '@/lib/api-client'

export const agendaService = {
  // --- Calendar / Schedule ---
  async getSchedule(startDate, endDate) {
    return apiClient.get('/agenda/schedule', { params: { startDate, endDate } })
  },
  
  async getMySessions() {
    return apiClient.get('/agenda/my-sessions')
  },

  // --- Sessions Management ---
  async getSessionDetails(id) {
    return apiClient.get(`/agenda/sessions/${id}`)
  },

  async updateSessionAttendance(id, attendanceList) {
    return apiClient.post(`/agenda/sessions/${id}/attendance`, { attendanceList })
  }
}
