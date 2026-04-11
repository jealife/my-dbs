package com.mydbs.backend.course.dto;

import com.mydbs.backend.course.model.SessionMode;
import com.mydbs.backend.course.model.SessionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record SessionCreateRequest(
        @NotBlank(message = "Le titre est obligatoire")
        String title,
        String description,
        @NotNull(message = "La date de debut est obligatoire")
        LocalDateTime startAt,
        @NotNull(message = "La date de fin est obligatoire")
        LocalDateTime endAt,
        @NotBlank(message = "Le fuseau horaire est obligatoire")
        String timezone,
        String meetingLink,
        String recordingLink,
        String locationLabel,
        @NotNull(message = "Le mode est obligatoire")
        SessionMode mode,
        SessionStatus status,
        Long lessonId
) {
}