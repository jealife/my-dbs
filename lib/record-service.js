import { apiClient } from '@/lib/api-client'

export const recordService = {
  // --- Attendance ---
  async getAttendance(studentCode) {
    return apiClient.get(`/records/attendance/${studentCode}`)
  },
  
  async reportAbsence(data) {
    return apiClient.post('/records/absences/report', data)
  },

  // --- Grades / Records ---
  async getGrades(studentCode) {
    return apiClient.get(`/records/grades/${studentCode}`)
  },

  async getTranscript(studentCode) {
    return apiClient.get(`/records/transcripts/${studentCode}`)
  }
}
