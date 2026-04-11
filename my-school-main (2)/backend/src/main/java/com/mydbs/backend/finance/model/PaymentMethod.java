package com.mydbs.backend.finance.model;

public enum PaymentMethod {
    CASH,           // Espèces
    BANK_TRANSFER,  // Virement bancaire
    CHECK,          // Chèque
    CARD,           // Carte bancaire
    MOBILE_MONEY,   // Mobile Money (Orange Money, Wave…)
    ONLINE          // Paiement en ligne
}
