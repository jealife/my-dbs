package com.mydbs.backend.course.dto;

public record CoursePublishResponse(
        Long courseId,
        String courseTitle,
        Integer versionNumber,
        boolean published,
        String message
) {
}