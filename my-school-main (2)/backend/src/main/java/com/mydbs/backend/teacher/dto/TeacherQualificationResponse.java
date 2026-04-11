package com.mydbs.backend.teacher.dto;

import java.time.LocalDateTime;

public record TeacherQualificationResponse(
        Long id,
        String title,
        String institutionName,
        String country,
        Integer yearAwarded,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}