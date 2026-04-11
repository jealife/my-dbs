package com.mydbs.backend.notification.dto;

import com.mydbs.backend.notification.model.Notification;
import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    String title,
    String message,
    String type,
    boolean isRead,
    LocalDateTime createdAt
) {
    public static NotificationResponse fromEntity(Notification notification) {
        return new NotificationResponse(
            notification.getId(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getType(),
            notification.getIsRead(),
            notification.getCreatedAt()
        );
    }
}
