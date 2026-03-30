package com.mydbs.backend.notification.service;

import com.mydbs.backend.notification.dto.NotificationResponse;
import com.mydbs.backend.notification.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;

public interface NotificationService {
    // Basic / Demo methods
    List<NotificationResponse> getUserNotifications(Long userId);
    Notification markAsRead(Long id);
    Integer markAllAsRead(Long userId);
    long countUnread(Long userId);
    void createNotification(Long userId, String title, String message, String type);
    void requestAccountInfo(Long userId);
    void sendCredentials(String identifier);

    // Full system methods for CommunicationController
    Page<Notification> getUserNotifications(Long userId, Pageable pageable);
    Notification push(Long userId, NotificationType type, String title, String message, 
                    String referenceType, Long referenceId, String actionUrl);

    // Announcements
    Announcement createAnnouncement(Long authorId, String title, String content, String audience, 
                                 Long cohortId, Long academicYearId, LocalDateTime publishedAt, 
                                 LocalDateTime expiresAt, boolean pinned);
    Page<Announcement> getActiveAnnouncements(String audience, Long cohortId, Pageable pageable);
    void deleteAnnouncement(Long id);

    // Messaging
    Message sendMessage(Long senderId, Long recipientId, String subject, String body, 
                       String threadId, Long parentMessageId);
    Page<Message> getInbox(Long userId, Pageable pageable);
    Page<Message> getSent(Long userId, Pageable pageable);
    Page<Message> getThread(String threadId, Pageable pageable);
    long countUnreadMessages(Long userId);
    Message readMessage(Long messageId, Long userId);
}
