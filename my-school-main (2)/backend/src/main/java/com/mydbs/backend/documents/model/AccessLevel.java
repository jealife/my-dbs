package com.mydbs.backend.documents.model;

public enum AccessLevel {
    PUBLIC,           // Visible par tous les utilisateurs authentifiés
    STUDENT_ONLY,     // Visible par l'étudiant concerné uniquement
    TEACHER,          // Visible par les enseignants et supérieurs
    MANAGER,          // Visible par les gestionnaires et supérieurs
    ADMIN_ONLY        // Super Admin uniquement
}
