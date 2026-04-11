package com.mydbs.backend.notification.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Message = messagerie interne entre deux utilisateurs.
 */
@Entity
@Table(name = "messages",
        indexes = {
                @Index(name = "idx_msg_sender", columnList = "sender_id"),
                @Index(name = "idx_msg_recipient", columnList = "recipient_id"),
                @Index(name = "idx_msg_thread", columnList = "thread_id"),
                @Index(name = "idx_msg_read", columnList = "is_read")
        })
public class Message extends BaseAuditEntity {

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(name = "recipient_id", nullable = false)
    private Long recipientId;

    /** ID de thread pour grouper les messages d'une conversation */
    @Column(name = "thread_id", length = 36)
    private String threadId;

    @Column(name = "subject", length = 300)
    private String subject;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "parent_message_id")
    private Long parentMessageId;   // Pour les réponses

    // Getters & Setters
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }
    public String getThreadId() { return threadId; }
    public void setThreadId(String threadId) { this.threadId = threadId; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
    public Long getParentMessageId() { return parentMessageId; }
    public void setParentMessageId(Long parentMessageId) { this.parentMessageId = parentMessageId; }
}
