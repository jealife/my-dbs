package com.mydbs.backend.course.dto;

import java.time.LocalDateTime;

public record CourseModuleResponse(
        Long id,
        String title,
        String description,
        String objectives,
        Integer displayOrder,
        Integer estimatedMinutes,
        Long courseId,
        String courseTitle,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String updatedBy
) {
}