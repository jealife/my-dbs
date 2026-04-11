package com.mydbs.backend.documents.model;

public enum DocumentType {
    CERTIFICATE,         // Certificat de scolarité
    TRANSCRIPT,          // Relevé de notes
    DIPLOMA,             // Diplôme
    ENROLLMENT_LETTER,   // Lettre d'inscription
    RECOMMENDATION,      // Lettre de recommandation
    INVOICE,             // Facture (lien GED)
    JUSTIFICATION,       // Justificatif (médical, etc.)
    COURSE_MATERIAL,     // Support de cours
    ASSIGNMENT_FILE,     // Fichier de devoir soumis
    ADMISSION_DOCUMENT,  // Document de candidature
    ADMINISTRATIVE,      // Document administratif divers
    OTHER                // Autre
}
