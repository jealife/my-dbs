package com.mydbs.backend.teacher.dto;

import jakarta.validation.constraints.NotBlank;

public record TeacherSpecializationRequest(
        @NotBlank(message = "Le libelle de specialisation est obligatoire")
        String label,
        String description,
        Boolean primarySpecialization
) {
}