package com.mydbs.backend.course.dto;

import com.mydbs.backend.course.model.MediaCategory;
import com.mydbs.backend.course.model.ResourceType;
import com.mydbs.backend.course.model.ResourceVisibility;

import java.time.LocalDateTime;

public record CourseResourceResponse(
        Long id,
        String title,
        String description,
        ResourceType resourceType,
        MediaCategory mediaCategory,
        ResourceVisibility visibility,
        String externalUrl,
        String storedFileName,
        String originalFileName,
        String fileExtension,
        String contentType,
        Long fileSize,
        String storagePath,
        String publicUrl,
        Long downloadCount,
        Long courseId,
        String courseTitle,
        Long courseModuleId,
        String courseModuleTitle,
        Long lessonId,
        String lessonTitle,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String updatedBy
) {
}