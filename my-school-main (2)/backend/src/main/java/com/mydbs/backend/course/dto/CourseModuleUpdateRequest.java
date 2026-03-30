package com.mydbs.backend.course.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CourseModuleUpdateRequest(
        @NotBlank(message = "Le titre est obligatoire")
        String title,
        String description,
        String objectives,
        @NotNull(message = "L'ordre est obligatoire")
        Integer displayOrder,
        Integer estimatedMinutes
) {
}