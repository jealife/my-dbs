package com.mydbs.backend.evaluation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record DeliberationCreateRequest(
        @NotBlank(message = "Le titre est obligatoire")
        String title,

        String semester,

        LocalDateTime scheduledAt,

        String notes,

        @NotNull(message = "L'identifiant de la cohorte est obligatoire")
        Long cohortId,

        @NotNull(message = "L'identifiant de l'année académique est obligatoire")
        Long academicYearId,

        Long presidentUserId
) {}
