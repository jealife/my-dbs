package com.mydbs.backend.notification.service.impl;

import com.mydbs.backend.notification.dto.NotificationResponse;
import com.mydbs.backend.notification.model.*;
import com.mydbs.backend.notification.repository.*;
import com.mydbs.backend.notification.service.NotificationService;
import com.mydbs.backend.notification.sse.SseEmitterRegistry;
import com.mydbs.backend.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final AnnouncementRepository announcementRepository;
    private final MessageRepository messageRepository;
    private final SseEmitterRegistry sseEmitterRegistry;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   AnnouncementRepository announcementRepository,
                                   MessageRepository messageRepository,
                                   SseEmitterRegistry sseEmitterRegistry,
                                   UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.announcementRepository = announcementRepository;
        this.messageRepository = messageRepository;
        this.sseEmitterRegistry = sseEmitterRegistry;
        this.userRepository = userRepository;
    }

    // --- BASIC / DEMO METHODS ---

    @Override
    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(n -> new NotificationResponse(n.getId(), n.getTitle(), n.getMessage(), n.getType(), n.getIsRead(), n.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Override
    public Notification markAsRead(Long id) {
        return notificationRepository.findById(id).map(n -> {
            n.setIsRead(true);
            return notificationRepository.save(n);
        }).orElse(null);
    }

    @Override
    public Integer markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
        return unread.size();
    }

    @Override
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public void createNotification(Long userId, String title, String message, String type) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setIsRead(false);
        n.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(n);
        
        // Notify via SSE
        sseEmitterRegistry.sendToUser(userId, "notification", n);
    }

    @Override
    public void requestAccountInfo(Long userId) {
        // Find admin (assuming ID 1)
        createNotification(1L, "Demande d'identifiants", 
            "L'utilisateur ID " + userId + " demande une assistance pour ses identifiants.", "WARNING");
        
        // Success notification for user
        createNotification(userId, "Demande envoyée", 
            "Votre demande d'assistance a été transmise à l'administrateur.", "SUCCESS");
    }

    @Override
    public void sendCredentials(String identifier) {
        java.util.Optional<com.mydbs.backend.user.model.User> userOpt = java.util.Optional.empty();
        
        if (identifier.contains("@")) {
            userOpt = userRepository.findByEmail(identifier);
        } else {
            try {
                userOpt = userRepository.findById(Long.valueOf(identifier));
            } catch (NumberFormatException e) {
                // Ignore parsing errors, it just won't find the user
            }
        }
        
        userOpt.ifPresent(user -> {
            String passwordHint = (user.getFirstName() != null && user.getUserCode() != null) 
                  ? user.getFirstName().toLowerCase() + "." + user.getUserCode()
                  : "Votre prénom (en minuscules) suivi d'un point (.) et de votre code étudiant.";
            
            String message = "Voici vos informations d'accès :\n"
                    + "- Identifiant (Email) : " + user.getEmail() + "\n"
                    + "- Mot de passe : " + passwordHint + "\n\n"
                    + "Veillez à conserver précieusement ces informations.";

            createNotification(user.getId(), "🔑 Vos identifiants de connexion", message, "INFO");
        });
    }

    // --- FULL SYSTEM METHODS FOR CONTROLLER ---

    @Override
    public Page<Notification> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Override
    public Notification push(Long userId, NotificationType type, String title, String message, 
                           String referenceType, Long referenceId, String actionUrl) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type.name());
        n.setIsRead(false);
        n.setCreatedAt(LocalDateTime.now());
        Notification saved = notificationRepository.save(n);
        sseEmitterRegistry.sendToUser(userId, "notification", saved);
        return saved;
    }

    // The previous markAsReadNotification method has been merged into markAsRead.

    // --- ANNOUNCEMENTS ---

    @Override
    public Announcement createAnnouncement(Long authorId, String title, String content, String audience, 
                                        Long cohortId, Long academicYearId, LocalDateTime publishedAt, 
                                        LocalDateTime expiresAt, boolean pinned) {
        Announcement a = new Announcement();
        a.setAuthorId(authorId);
        a.setTitle(title);
        a.setContent(content);
        a.setAudience(audience);
        a.setCohortId(cohortId);
        a.setAcademicYearId(academicYearId);
        a.setPublishedAt(publishedAt != null ? publishedAt : LocalDateTime.now());
        a.setExpiresAt(expiresAt);
        a.setPinned(pinned);
        a.setCreatedAt(LocalDateTime.now());
        Announcement saved = announcementRepository.save(a);
        sseEmitterRegistry.broadcast("announcement", saved);
        return saved;
    }

    @Override
    public Page<Announcement> getActiveAnnouncements(String audience, Long cohortId, Pageable pageable) {
        return announcementRepository.findActive(LocalDateTime.now(), audience, cohortId, pageable);
    }

    @Override
    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }

    // --- MESSAGING ---

    @Override
    public Message sendMessage(Long senderId, Long recipientId, String subject, String body, 
                              String threadId, Long parentMessageId) {
        Message m = new Message();
        m.setSenderId(senderId);
        m.setRecipientId(recipientId);
        m.setSubject(subject);
        m.setBody(body);
        m.setThreadId(threadId != null ? threadId : UUID.randomUUID().toString());
        m.setParentMessageId(parentMessageId);
        m.setRead(false);
        m.setCreatedAt(LocalDateTime.now());
        Message saved = messageRepository.save(m);
        sseEmitterRegistry.sendToUser(recipientId, "message", saved);
        return saved;
    }

    @Override
    public Page<Message> getInbox(Long userId, Pageable pageable) {
        return messageRepository.findByRecipientIdAndArchivedFalseOrderByCreatedAtDesc(userId, pageable);
    }

    @Override
    public Page<Message> getSent(Long userId, Pageable pageable) {
        return messageRepository.findBySenderIdAndArchivedFalseOrderByCreatedAtDesc(userId, pageable);
    }

    @Override
    public Page<Message> getThread(String threadId, Pageable pageable) {
        return messageRepository.findByThreadIdAndArchivedFalseOrderByCreatedAtAsc(threadId, pageable);
    }

    @Override
    public long countUnreadMessages(Long userId) {
        return messageRepository.countByRecipientIdAndIsReadFalseAndArchivedFalse(userId);
    }

    @Override
    public Message readMessage(Long messageId, Long userId) {
        return messageRepository.findById(messageId).map(m -> {
            if (m.getRecipientId().equals(userId)) {
                m.setRead(true);
                return messageRepository.save(m);
            }
            return m;
        }).orElse(null);
    }
}
