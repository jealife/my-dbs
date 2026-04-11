package com.mydbs.backend.teacher.dto;

import com.mydbs.backend.teacher.model.TeacherStatus;

import java.time.LocalDateTime;

public record TeacherStatusHistoryResponse(
        Long id,
        TeacherStatus oldStatus,
        TeacherStatus newStatus,
        String reason,
        String contextLabel,
        LocalDateTime createdAt,
        String createdBy
) {
}