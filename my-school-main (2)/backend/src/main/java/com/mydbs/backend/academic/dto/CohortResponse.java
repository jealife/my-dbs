package com.mydbs.backend.academic.dto;

import com.mydbs.backend.academic.model.CohortStatus;

import java.time.LocalDateTime;

public record CohortResponse(
        Long id,
        String name,
        String code,
        String description,
        Integer maxCapacity,
        CohortStatus status,
        Long academicYearId,
        String academicYearName,
        Long programId,
        String programName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String updatedBy
) {
}