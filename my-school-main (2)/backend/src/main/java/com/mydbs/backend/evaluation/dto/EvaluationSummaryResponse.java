package com.mydbs.backend.evaluation.dto;

import com.mydbs.backend.evaluation.model.EvaluationType;

import java.time.LocalDateTime;

public record EvaluationSummaryResponse(
        Long id,
        String title,
        EvaluationType evaluationType,
        com.mydbs.backend.evaluation.model.EvaluationStatus status,
        Double maxScore,
        LocalDateTime scheduledAt,
        String courseTitle,
        String courseCode,
        Long totalStudents,
        Long gradedStudents,
        Double averageScore,
        LocalDateTime createdAt
) {}
