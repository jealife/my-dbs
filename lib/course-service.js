import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const courseService = {
  /**
   * Get course catalog (all or filtered)
   */
  async getCourses(params = {}) {
    const res = await apiClient.get('/courses', { params })
    return extractList(res.data)
  },

  /**
   * Get a single course by ID
   */
  async getCourseById(id) {
    const res = await apiClient.get(`/courses/${id}`)
    return extractItem(res.data)
  },

  /**
   * Get lessons for a course
   */
  async getLessons(courseId) {
    const res = await apiClient.get(`/courses/${courseId}/lessons`)
    return extractList(res.data)
  },

  /**
   * Get enrolled courses for a student 
   */
  async getMyCourses(studentId) {
    const res = await apiClient.get(`/courses/student/${studentId}`)
    return extractList(res.data)
  },

  /**
   * Get courses taught by a teacher
   */
  async getTeacherCourses(teacherId) {
    const res = await apiClient.get(`/courses/teacher/${teacherId}`)
    return extractList(res.data)
  },

  /**
   * Enroll in a course
   */
  async enroll(courseId) {
    const res = await apiClient.post(`/courses/${courseId}/enroll`)
    return extractItem(res.data)
  },

  /**
   * Get student progress in a course
   */
  async getProgress(courseId, studentId) {
    const res = await apiClient.get(`/courses/${courseId}/progress/${studentId}`)
    return extractItem(res.data)
  },

  /**
   * Mark a lesson as complete
   */
  async markLessonComplete(courseId, lessonId) {
    const res = await apiClient.post(`/courses/${courseId}/lessons/${lessonId}/complete`)
    return extractItem(res.data)
  },
}
