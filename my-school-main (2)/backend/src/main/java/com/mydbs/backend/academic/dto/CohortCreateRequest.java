package com.mydbs.backend.academic.dto;

import com.mydbs.backend.academic.model.CohortStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CohortCreateRequest(
        @NotBlank(message = "Le nom est obligatoire")
        String name,

        @NotBlank(message = "Le code est obligatoire")
        String code,

        String description,
        Integer maxCapacity,

        @NotNull(message = "L'annee academique est obligatoire")
        Long academicYearId,

        @NotNull(message = "Le programme est obligatoire")
        Long programId,

        CohortStatus status
) {
}