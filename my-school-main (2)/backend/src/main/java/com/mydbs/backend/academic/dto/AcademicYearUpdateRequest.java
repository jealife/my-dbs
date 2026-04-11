package com.mydbs.backend.academic.dto;

import com.mydbs.backend.academic.model.AcademicYearStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AcademicYearUpdateRequest(
        @NotBlank(message = "Le nom est obligatoire")
        String name,

        @NotBlank(message = "Le code est obligatoire")
        String code,

        String description,

        @NotNull(message = "La date de debut est obligatoire")
        LocalDate startDate,

        @NotNull(message = "La date de fin est obligatoire")
        LocalDate endDate,

        Boolean currentYear,

        @NotNull(message = "Le statut est obligatoire")
        AcademicYearStatus status
) {
}