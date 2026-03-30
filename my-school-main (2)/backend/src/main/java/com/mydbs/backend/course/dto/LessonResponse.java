package com.mydbs.backend.course.dto;

import java.time.LocalDateTime;

public record LessonResponse(
        Long id,
        String title,
        String summary,
        String content,
        Integer displayOrder,
        Integer estimatedMinutes,
        Long courseModuleId,
        String courseModuleTitle,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String updatedBy
) {
}