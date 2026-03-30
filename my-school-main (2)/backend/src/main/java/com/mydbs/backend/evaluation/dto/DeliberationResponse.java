package com.mydbs.backend.evaluation.dto;

import java.time.LocalDateTime;

public record DeliberationResponse(
        Long id,
        String title,
        String semester,
        boolean published,
        LocalDateTime scheduledAt,
        LocalDateTime closedAt,
        String notes,
        Long cohortId,
        String cohortName,
        Long academicYearId,
        String academicYearName,
        Long presidentUserId,
        LocalDateTime createdAt,
        String createdBy
) {}
