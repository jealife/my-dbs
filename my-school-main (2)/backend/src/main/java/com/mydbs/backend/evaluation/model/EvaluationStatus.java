package com.mydbs.backend.evaluation.model;

public enum EvaluationStatus {
    DRAFT,             // Créée, non visible des étudiants
    SCHEDULED,         // Programmée, visible dans l'agenda
    IN_PROGRESS,       // Saisie des notes en cours
    CLOSED,            // Saisie terminée, résultats non publiés
    RESULTS_PUBLISHED  // Notes visibles par les étudiants
}
