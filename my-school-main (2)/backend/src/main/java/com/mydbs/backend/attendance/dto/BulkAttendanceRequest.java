package com.mydbs.backend.attendance.dto;

import com.mydbs.backend.attendance.model.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record BulkAttendanceRequest(
        @NotNull Long sessionId,
        @NotNull List<AttendanceEntryRequest> entries
) {}
