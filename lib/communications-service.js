import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const communicationsService = {
  /**
   * Get inbox messages for a user
   */
  async getInbox(userId) {
    const res = await apiClient.get(`/communications/messages/inbox/${userId}`)
    return extractList(res.data)
  },

  /**
   * Get sent messages for a user
   */
  async getSent(userId) {
    const res = await apiClient.get(`/communications/messages/sent/${userId}`)
    return extractList(res.data)
  },

  /**
   * Get a conversation thread
   */
  async getThread(threadId) {
    const res = await apiClient.get(`/communications/messages/thread/${threadId}`)
    return extractList(res.data)
  },

  /**
   * Send a message
   */
  async sendMessage(messageData) {
    const res = await apiClient.post('/communications/messages', messageData)
    return extractItem(res.data)
  },

  /**
   * Mark a message as read
   */
  async markRead(messageId) {
    await apiClient.patch(`/communications/messages/${messageId}/read`)
  },

  /**
   * Get unread message count
   */
  async getUnreadCount(userId) {
    const res = await apiClient.get(`/communications/messages/users/${userId}/unread-count`)
    return extractItem(res.data)
  },

  /**
   * Get notifications for a user
   */
  async getNotifications(userId, params = {}) {
    const res = await apiClient.get(`/communications/notifications/users/${userId}`, { params })
    return extractList(res.data)
  },

  /**
   * Get unread notification count
   */
  async getUnreadNotifCount(userId) {
    const res = await apiClient.get(`/communications/notifications/users/${userId}/unread-count`)
    return extractItem(res.data)
  },

  /**
   * Mark a notification as read
   */
  async markNotifRead(notifId) {
    await apiClient.patch(`/communications/notifications/${notifId}/read`)
  },

  /**
   * Mark all notifications as read
   */
  async markAllNotifsRead(userId) {
    await apiClient.patch(`/communications/notifications/users/${userId}/read-all`)
  },

  /**
   * Get public announcements
   */
  async getAnnouncements(params = {}) {
    const res = await apiClient.get('/communications/announcements', { params })
    return extractList(res.data)
  },
}
