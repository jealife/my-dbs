package com.mydbs.backend.attendance.dto;

import com.mydbs.backend.attendance.model.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record AttendanceEntryRequest(
        @NotNull Long studentId,
        @NotNull AttendanceStatus status,
        LocalTime arrivalTime,
        Integer lateMinutes,
        String teacherNote
) {}
