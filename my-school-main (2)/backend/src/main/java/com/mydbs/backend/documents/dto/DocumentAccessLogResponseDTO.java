package com.mydbs.backend.documents.dto;

import com.mydbs.backend.user.dto.UserSummaryDTO;
import java.time.LocalDateTime;

/**
 * Réponse pour une entrée du journal d'audit des documents.
 */
public record DocumentAccessLogResponseDTO(
        Long id,
        String action,
        LocalDateTime accessedAt,
        String ipAddress,
        Long versionId,
        UserSummaryDTO user
) {
}
