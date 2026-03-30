package com.mydbs.backend.attendance.dto;

import com.mydbs.backend.attendance.model.JustificationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record JustificationResponse(
        Long id,
        Long studentId,
        String studentFirstName,
        String studentLastName,
        String studentNumber,
        Long attendanceRecordId,
        String reason,
        LocalDate absenceDateFrom,
        LocalDate absenceDateTo,
        String documentName,
        String documentPath,
        JustificationStatus status,
        String reviewerComment,
        LocalDateTime createdAt,
        String createdBy
) {}
