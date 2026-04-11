package com.mydbs.backend.evaluation.dto;

import java.time.LocalDateTime;

public record RubricResponse(
        Long id,
        String criterionName,
        String description,
        Double maxPoints,
        Double weightPercentage,
        Integer orderIndex,
        LocalDateTime createdAt
) {}
