package com.mydbs.backend.evaluation.dto;

import com.mydbs.backend.evaluation.model.ResultStatus;

import java.time.LocalDateTime;

public record EvaluationResultResponse(
        Long id,
        Long evaluationId,
        String evaluationTitle,
        Long studentId,
        String studentFirstName,
        String studentLastName,
        String studentNumber,
        Double score,
        Double maxScore,
        Double scorePercentage,
        ResultStatus status,
        String teacherComment,
        boolean compensated,
        LocalDateTime gradedAt,
        LocalDateTime createdAt
) {}
