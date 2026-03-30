package com.mydbs.backend.notification.repository;

import com.mydbs.backend.notification.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
    Page<Message> findByRecipientIdAndArchivedFalseOrderByCreatedAtDesc(Long recipientId, Pageable pageable);
    Page<Message> findBySenderIdAndArchivedFalseOrderByCreatedAtDesc(Long senderId, Pageable pageable);
    Page<Message> findByThreadIdAndArchivedFalseOrderByCreatedAtAsc(String threadId, Pageable pageable);
    long countByRecipientIdAndIsReadFalseAndArchivedFalse(Long recipientId);
}
