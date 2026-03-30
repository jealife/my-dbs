package com.mydbs.backend.assignment.model;

public enum SubmissionStatus {
    NOT_SUBMITTED,   // Aucune soumission encore
    SUBMITTED,       // Soumis dans les délais
    LATE,            // Soumis hors délais
    UNDER_REVIEW,    // En cours de correction
    GRADED,          // Corrigé et noté
    RETURNED         // Rendu à l'étudiant avec feedback
}
