package com.mydbs.backend.academic.dto;

import com.mydbs.backend.academic.model.ProgramStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProgramUpdateRequest(
        @NotBlank(message = "Le nom est obligatoire")
        String name,

        @NotBlank(message = "Le code est obligatoire")
        String code,

        String description,
        String departmentName,
        String facultyName,

        @NotBlank(message = "Le niveau est obligatoire")
        String level,

        @NotNull(message = "La duree est obligatoire")
        Integer durationInMonths,

        @NotNull(message = "Le nombre de credits requis est obligatoire")
        Integer creditsRequired,

        @NotNull(message = "Le statut est obligatoire")
        ProgramStatus status
) {
}