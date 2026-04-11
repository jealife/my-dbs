package com.mydbs.backend.ue.dto;

import java.time.LocalDateTime;

public record TeachingUnitResponse(
        Long id,
        String code,
        String name,
        String description,
        String semester,
        Integer orderIndex,
        Long programId,
        String programName,
        LocalDateTime createdAt
) {}
