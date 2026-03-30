package com.mydbs.backend.notification.repository;

import com.mydbs.backend.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    org.springframework.data.domain.Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, org.springframework.data.domain.Pageable pageable);
    long countByUserIdAndIsReadFalse(Long userId);
    List<Notification> findByUserIdAndIsReadFalse(Long userId);
}
