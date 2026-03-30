package com.mydbs.backend.academic.dto;

import com.mydbs.backend.academic.model.ClassRoomStatus;

import java.time.LocalDateTime;

public record ClassRoomResponse(
        Long id,
        String name,
        String code,
        String description,
        Integer capacity,
        String deliveryMode,
        String roomLabel,
        ClassRoomStatus status,
        Long academicYearId,
        String academicYearName,
        Long programId,
        String programName,
        Long cohortId,
        String cohortName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String updatedBy
) {
}