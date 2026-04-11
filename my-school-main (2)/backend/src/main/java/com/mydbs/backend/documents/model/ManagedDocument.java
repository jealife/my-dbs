package com.mydbs.backend.documents.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

/**
 * ManagedDocument = document géré dans la GED.
 * Point d'entrée unique pour tous les fichiers numériques de la plateforme.
 */
@Entity
@Table(name = "managed_documents",
        indexes = {
                @Index(name = "idx_doc_owner", columnList = "owner_id"),
                @Index(name = "idx_doc_type", columnList = "document_type"),
                @Index(name = "idx_doc_access", columnList = "access_level"),
                @Index(name = "idx_doc_ref_type", columnList = "reference_type"),
                @Index(name = "idx_doc_ref_id", columnList = "reference_id")
        })
public class ManagedDocument extends BaseAuditEntity {

    /** Utilisateur propriétaire du document */
    @Column(name = "owner_id")
    private Long ownerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 30)
    private DocumentType documentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_level", nullable = false, length = 20)
    private AccessLevel accessLevel = AccessLevel.MANAGER;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "description", length = 1000)
    private String description;

    /** Entité liée (STUDENT, ADMISSION, INVOICE, ASSIGNMENT …) */
    @Column(name = "reference_type", length = 50)
    private String referenceType;

    /** ID de l'entité liée */
    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "tags", length = 500)
    private String tags;   // CSV : "admission,2026,S1"

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "academic_year_id")
    private Long academicYearId;

    @Column(name = "current_version_id")
    private Long currentVersionId;   // FK vers DocumentVersion.id (lazy, géré en service)

    // Getters & Setters
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public DocumentType getDocumentType() { return documentType; }
    public void setDocumentType(DocumentType documentType) { this.documentType = documentType; }
    public AccessLevel getAccessLevel() { return accessLevel; }
    public void setAccessLevel(AccessLevel accessLevel) { this.accessLevel = accessLevel; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }
    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public Long getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }
    public Long getCurrentVersionId() { return currentVersionId; }
    public void setCurrentVersionId(Long currentVersionId) { this.currentVersionId = currentVersionId; }
}
