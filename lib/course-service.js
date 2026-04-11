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
    const res = await apiClient.get('/courses', { params: { studentId } })
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
   * Create a new course
   */
  async createCourse(data) {
    const res = await apiClient.post('/courses', data)
    return extractItem(res.data)
  },

  /**
   * Enroll authenticated user in a course
   */
  async enroll(courseId, userId) {
    const res = await apiClient.post(`/courses/${courseId}/enroll`, { userId })
    return res.data?.data ?? res.data
  },

  /**
   * Get student progress in a course
   */
  async getProgress(courseId, userId) {
    if (!courseId || !userId) return { enrolled: false, completionPercent: 0, completedLessons: [], totalLessons: 0 }
    const res = await apiClient.get(`/courses/${courseId}/progress/${userId}`)
    return res.data?.data ?? res.data
  },

  /**
   * Mark a lesson as complete for the authenticated user
   */
  async markLessonComplete(courseId, lessonId, userId) {
    const res = await apiClient.post(`/courses/${courseId}/lessons/${lessonId}/complete`, { userId })
    return res.data?.data ?? res.data
  },

  async getAcademicYears() {
    const res = await apiClient.get('/academic-years')
    return extractList(res.data)
  },

  async getPrograms() {
    const res = await apiClient.get('/programs')
    return extractList(res.data)
  },

  async getModules(courseId) {
    const res = await apiClient.get(`/course-modules/course/${courseId}`)
    return extractList(res.data)
  },

  async getLessonsForModule(moduleId) {
    const res = await apiClient.get(`/lessons/module/${moduleId}`)
    return extractList(res.data)
  },

  async getResources(courseId) {
    const res = await apiClient.get(`/course-resources/course/${courseId}`)
    return extractList(res.data)
  },

  async getSessions(courseId) {
    const res = await apiClient.get(`/course-sessions/course/${courseId}`)
    return extractList(res.data)
  },

  async publishCourse(id) {
    const res = await apiClient.post(`/courses/${id}/publish`)
    return extractItem(res.data)
  },

  async unpublishCourse(id) {
    const res = await apiClient.post(`/courses/${id}/unpublish`)
    return extractItem(res.data)
  },

  async archiveCourse(id) {
    const res = await apiClient.delete(`/courses/${id}`)
    return res.data
  },

  /**
   * Update a course
   */
  async updateCourse(id, data) {
    const res = await apiClient.put(`/courses/${id}`, data)
    return extractItem(res.data)
  },

  /**
   * Upload course resource/file
   */
  async uploadResource(courseId, formData) {
    formData.append('courseId', courseId)
    const res = await apiClient.post(`/course-resources/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return extractItem(res.data)
  },

  /**
   * Delete a course resource
   */
  async deleteResource(resourceId) {
    const res = await apiClient.delete(`/course-resources/${resourceId}`)
    return res.data
  },

  /**
   * Create a course module
   */
  async createModule(courseId, data) {
    const res = await apiClient.post(`/course-modules/course/${courseId}`, data)
    return extractItem(res.data)
  },

  /**
   * Update a course module
   */
  async updateModule(moduleId, data) {
    const res = await apiClient.put(`/course-modules/${moduleId}`, data)
    return extractItem(res.data)
  },

  /**
   * Delete a course module
   */
  async deleteModule(moduleId) {
    const res = await apiClient.delete(`/course-modules/${moduleId}`)
    return res.data
  },

  /**
   * Create a lesson in a module
   */
  async createLesson(moduleId, data) {
    const res = await apiClient.post(`/lessons/module/${moduleId}`, data)
    return extractItem(res.data)
  },

  /**
   * Update a lesson
   */
  async updateLesson(lessonId, data) {
    const res = await apiClient.put(`/lessons/${lessonId}`, data)
    return extractItem(res.data)
  },

  /**
   * Delete a lesson
   */
  async deleteLesson(lessonId) {
    const res = await apiClient.delete(`/lessons/${lessonId}`)
    return res.data
  },

  /**
   * Assign (or unassign) a single classroom to a course (legacy single-class)
   */
  async assignClassRoom(courseId, classRoomId) {
    const res = await apiClient.patch(`/courses/${courseId}/classroom`, { classRoomId: classRoomId ?? null })
    return extractItem(res.data)
  },

  /**
   * Assign multiple classrooms to a course (many-to-many)
   */
  async assignClasses(courseId, classIds) {
    const res = await apiClient.post(`/courses/${courseId}/classes`, { classIds })
    return res.data?.data ?? res.data
  },

  /**
   * Get classrooms currently assigned to a course
   */
  async getAssignedClasses(courseId) {
    const res = await apiClient.get(`/courses/${courseId}/classes`)
    const d = res.data?.data ?? res.data
    return Array.isArray(d) ? d : (d?.content ?? [])
  },

  /**
   * Remove a classroom assignment from a course
   */
  async removeClassFromCourse(courseId, classId) {
    const res = await apiClient.delete(`/courses/${courseId}/classes/${classId}`)
    return res.data
  },

  /**
   * Get all classrooms (for dropdowns)
   */
  async getClasses() {
    const res = await apiClient.get('/classes')
    const d = res.data?.data ?? res.data
    return Array.isArray(d) ? d : (d?.content ?? [])
  },

  /**
   * Get teaching units (UEs) — optionally filtered by program and/or semester
   */
  async getTeachingUnits(params = {}) {
    const res = await apiClient.get('/v1/teaching-units', { params })
    const d = res.data?.data ?? res.data
    return Array.isArray(d) ? d : []
  },
}
