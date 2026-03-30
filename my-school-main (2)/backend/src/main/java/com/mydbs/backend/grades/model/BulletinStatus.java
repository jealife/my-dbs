package com.mydbs.backend.grades.model;

public enum BulletinStatus {
    DRAFT,        // En cours de génération
    GENERATED,    // Calculé et prêt
    PUBLISHED,    // Publié aux étudiants et parents
    ARCHIVED      // Archivé (fin d'année)
}
