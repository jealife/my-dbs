import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

/**
 * Communications service — backend base : /api/v1/communications
 * Also covers legacy /api/notifications endpoints.
 */
export const communicationsService = {
  // ── Messaging ──────────────────────────────────────────────────────────────

  /**
   * Get inbox messages for a user
   */
  async getInbox(userId) {
    const res = await apiClient.get(`/v1/communications/messages/inbox/${userId}`)
    return extractList(res.data)
  },

  /**
   * Get sent messages for a user
   */
  async getSent(userId) {
    const res = await apiClient.get(`/v1/communications/messages/sent/${userId}`)
    return extractList(res.data)
  },

  /**
   * Get a conversation thread
   */
  async getThread(threadId) {
    const res = await apiClient.get(`/v1/communications/messages/thread/${threadId}`)
    return extractList(res.data)
  },

  /**
   * Send a message
   */
  async sendMessage(messageData) {
    // Backend expects RequestParams: senderId, recipientId, subject, body, threadId, parentMessageId
    const res = await apiClient.post('/v1/communications/messages', null, { params: messageData })
    return extractItem(res.data)
  },

  /**
   * Mark a message as read
   */
  async markRead(messageId, userId) {
    await apiClient.patch(`/v1/communications/messages/${messageId}/read`, null, { params: { userId } })
  },

  /**
   * Get unread message count
   */
  async getUnreadCount(userId) {
    const res = await apiClient.get(`/v1/communications/messages/users/${userId}/unread-count`)
    return extractItem(res.data)
  },

  // ── Notifications (via /api/v1/communications) ─────────────────────────────

  /**
   * Get notifications for a user
   */
  async getNotifications(userId, params = {}) {
    const res = await apiClient.get(`/v1/communications/notifications/users/${userId}`, { params })
    return extractList(res.data)
  },

  /**
   * Get unread notification count
   */
  async getUnreadNotifCount(userId) {
    const res = await apiClient.get(`/v1/communications/notifications/users/${userId}/unread-count`)
    return extractItem(res.data)
  },

  /**
   * Mark a notification as read
   */
  async markNotifRead(notifId) {
    await apiClient.patch(`/v1/communications/notifications/${notifId}/read`)
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllNotifsRead(userId) {
    await apiClient.patch(`/v1/communications/notifications/users/${userId}/read-all`)
  },

  // ── Announcements ──────────────────────────────────────────────────────────

  /**
   * Get public announcements
   */
  async getAnnouncements(params = {}) {
    const res = await apiClient.get('/v1/communications/announcements', { params })
    return extractList(res.data)
  },

  /**
   * Create an announcement (admin)
   */
  async createAnnouncement(data) {
    const res = await apiClient.post('/v1/communications/announcements', data)
    return extractItem(res.data)
  },
}

/**
 * Legacy notifications service — some components may still use the
 * /api/notifications controller directly. We keep a thin alias.
 */
export const notificationsService = {
  async getForUser(userId) {
    const res = await apiClient.get(`/notifications/user/${userId}`)
    return extractList(res.data)
  },
  async getUnreadCount(userId) {
    const res = await apiClient.get(`/notifications/unread-count/${userId}`)
    return extractItem(res.data)
  },
  async markRead(id) {
    await apiClient.patch(`/notifications/${id}/read`)
  },
  async markAllRead(userId) {
    await apiClient.patch(`/notifications/user/${userId}/read-all`)
  },
}
