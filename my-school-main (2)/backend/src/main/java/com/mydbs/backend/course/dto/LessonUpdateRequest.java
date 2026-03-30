package com.mydbs.backend.course.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LessonUpdateRequest(
        @NotBlank(message = "Le titre est obligatoire")
        String title,
        String summary,
        String content,
        @NotNull(message = "L'ordre est obligatoire")
        Integer displayOrder,
        Integer estimatedMinutes
) {
}