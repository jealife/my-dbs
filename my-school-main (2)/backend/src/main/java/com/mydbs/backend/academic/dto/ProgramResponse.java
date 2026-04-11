package com.mydbs.backend.academic.dto;

import com.mydbs.backend.academic.model.ProgramStatus;

import java.time.LocalDateTime;

public record ProgramResponse(
        Long id,
        String name,
        String code,
        String description,
        String departmentName,
        String facultyName,
        String level,
        Integer durationInMonths,
        Integer creditsRequired,
        ProgramStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String updatedBy
) {
}