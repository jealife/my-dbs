package com.mydbs.backend.finance.model;

public enum InvoiceStatus {
    DRAFT,     // Brouillon
    ISSUED,    // Émise
    PAID,      // Payée intégralement
    PARTIAL,   // Partiellement payée
    OVERDUE,   // Échéance dépassée
    CANCELLED  // Annulée
}
