package com.mydbs.backend.evaluation.model;

public enum ResultStatus {
    PENDING,    // Note non encore saisie
    GRADED,     // Note saisie
    ABSENT,     // Étudiant absent
    EXCUSED,    // Absence justifiée
    PUBLISHED   // Résultat publié et visible
}
