package com.mydbs.backend.notification.model;

public enum NotificationType {
    INFO,
    SUCCESS,
    WARNING,
    ERROR,
    REMINDER,    // Rappel d'échéance (paiement, devoir, etc.)
    SYSTEM       // Notification système
}
