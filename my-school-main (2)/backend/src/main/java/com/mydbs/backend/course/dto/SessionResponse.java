package com.mydbs.backend.course.dto;

import com.mydbs.backend.course.model.SessionMode;
import com.mydbs.backend.course.model.SessionStatus;

import java.time.LocalDateTime;

public record SessionResponse(
        Long id,
        String title,
        String description,
        LocalDateTime startAt,
        LocalDateTime endAt,
        String timezone,
        String meetingLink,
        String recordingLink,
        String locationLabel,
        SessionMode mode,
        SessionStatus status,
        Long courseId,
        String courseTitle,
        Long lessonId,
        String lessonTitle,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String updatedBy
) {
}