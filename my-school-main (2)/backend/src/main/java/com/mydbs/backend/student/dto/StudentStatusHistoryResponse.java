package com.mydbs.backend.student.dto;

import com.mydbs.backend.student.model.StudentStatus;

import java.time.LocalDateTime;

public record StudentStatusHistoryResponse(
        Long id,
        StudentStatus oldStatus,
        StudentStatus newStatus,
        String reason,
        String contextLabel,
        LocalDateTime createdAt,
        String createdBy
) {
}