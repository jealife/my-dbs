package com.mydbs.backend.assignment.model;

public enum QuestionType {
    SINGLE_CHOICE,    // QCM — une seule bonne réponse
    MULTIPLE_CHOICE,  // QCM — plusieurs bonnes réponses
    TRUE_FALSE,       // Vrai / Faux
    SHORT_ANSWER,     // Réponse courte libre (correction manuelle)
    ESSAY             // Réponse longue / dissertation (correction manuelle)
}
