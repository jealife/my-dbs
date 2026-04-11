package com.mydbs.backend.documents.dto;

import com.mydbs.backend.documents.model.AccessLevel;
import com.mydbs.backend.documents.model.DocumentType;
import com.mydbs.backend.documents.model.ManagedDocument;
import com.mydbs.backend.user.dto.UserSummaryDTO;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Réponse détaillée pour un document avec informations du propriétaire.
 */
public record ManagedDocumentResponseDTO(
        Long id,
        String title,
        String description,
        DocumentType documentType,
        AccessLevel accessLevel,
        String referenceType,
        Long referenceId,
        String tags,
        LocalDate expiryDate,
        Long academicYearId,
        Long currentVersionId,
        LocalDateTime createdAt,
        UserSummaryDTO owner
) {
    public static ManagedDocumentResponseDTO fromEntity(ManagedDocument doc, UserSummaryDTO owner) {
        return new ManagedDocumentResponseDTO(
                doc.getId(),
                doc.getTitle(),
                doc.getDescription(),
                doc.getDocumentType(),
                doc.getAccessLevel(),
                doc.getReferenceType(),
                doc.getReferenceId(),
                doc.getTags(),
                doc.getExpiryDate(),
                doc.getAcademicYearId(),
                doc.getCurrentVersionId(),
                doc.getCreatedAt(),
                owner
        );
    }
}
