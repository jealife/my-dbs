package com.mydbs.backend.finance.model;

public enum PaymentStatus {
    PENDING,     // En attente de paiement
    PAID,        // Payé
    PARTIAL,     // Partiellement payé
    OVERDUE,     // En retard
    CANCELLED,   // Annulé
    REFUNDED     // Remboursé
}
