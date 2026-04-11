package com.mydbs.backend.student.dto;

import com.mydbs.backend.student.model.StudentStatus;
import jakarta.validation.constraints.NotNull;

public record StudentStatusUpdateRequest(
        @NotNull(message = "Le nouveau statut est obligatoire")
        StudentStatus status,
        String reason,
        String contextLabel
) {
}