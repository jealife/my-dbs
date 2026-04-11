package com.mydbs.backend.teacher.dto;

import com.mydbs.backend.teacher.model.TeacherStatus;
import jakarta.validation.constraints.NotNull;

public record TeacherStatusUpdateRequest(
        @NotNull(message = "Le nouveau statut est obligatoire")
        TeacherStatus status,
        String reason,
        String contextLabel
) {
}