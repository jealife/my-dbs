package com.mydbs.backend.attendance.dto;

import com.mydbs.backend.attendance.model.AttendanceStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public record AttendanceRecordResponse(
        Long id,
        Long sessionId,
        LocalDate sessionDate,
        String courseTitle,
        String courseCode,
        Long studentId,
        String studentFirstName,
        String studentLastName,
        String studentNumber,
        AttendanceStatus status,
        LocalTime arrivalTime,
        Integer lateMinutes,
        String teacherNote,
        java.time.LocalDateTime createdAt,
        String createdBy
) {}
