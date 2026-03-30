package com.mydbs.backend.attendance.model;

public enum JustificationStatus {
    PENDING,   // En attente d'examen
    APPROVED,  // Justification acceptée → statut EXCUSED
    REJECTED   // Justification refusée → statut reste ABSENT
}
