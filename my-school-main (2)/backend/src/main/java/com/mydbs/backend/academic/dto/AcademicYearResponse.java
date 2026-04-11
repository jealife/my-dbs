package com.mydbs.backend.academic.dto;

import com.mydbs.backend.academic.model.AcademicYearStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AcademicYearResponse(
        Long id,
        String name,
        String code,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        boolean currentYear,
        AcademicYearStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String updatedBy
) {
}