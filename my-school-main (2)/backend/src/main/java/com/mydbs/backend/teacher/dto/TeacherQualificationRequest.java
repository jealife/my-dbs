package com.mydbs.backend.teacher.dto;

import jakarta.validation.constraints.NotBlank;

public record TeacherQualificationRequest(
        @NotBlank(message = "Le titre du diplome est obligatoire")
        String title,
        @NotBlank(message = "Le nom de l'institution est obligatoire")
        String institutionName,
        String country,
        Integer yearAwarded,
        String description
) {
}