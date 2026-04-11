package com.mydbs.backend.teacher.dto;

import java.time.LocalDateTime;

public record TeacherSpecializationResponse(
        Long id,
        String label,
        String description,
        boolean primarySpecialization,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}