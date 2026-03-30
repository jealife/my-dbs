package com.mydbs.backend.admissions.dto;

import com.mydbs.backend.admissions.model.ApplicationPriority;
import com.mydbs.backend.admissions.model.ApplicationStatus;

import java.time.LocalDateTime;

public record AdmissionApplicationSummaryResponse(
        Long id,
        String applicationNumber,
        String firstName,
        String lastName,
        String email,
        ApplicationStatus status,
        ApplicationPriority priority,
        String programName,
        String academicYearName,
        LocalDateTime submittedAt,
        LocalDateTime createdAt
) {}
