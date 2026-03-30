package com.mydbs.backend.grades.model;

public enum GradeItemType {
    EVALUATION,    // Lié à une Evaluation (Module 2)
    ASSIGNMENT,    // Lié à un Assignment/devoir (Module 3)
    QUIZ,          // Lié à un quiz/tentative (Module 3)
    PARTICIPATION, // Note de participation manuelle
    MANUAL         // Note saisie manuellement (hors modules liés)
}
