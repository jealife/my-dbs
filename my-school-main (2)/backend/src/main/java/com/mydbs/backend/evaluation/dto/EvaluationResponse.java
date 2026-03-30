package com.mydbs.backend.evaluation.dto;

import com.mydbs.backend.evaluation.model.EvaluationStatus;
import com.mydbs.backend.evaluation.model.EvaluationType;

import java.time.LocalDateTime;

public record EvaluationResponse(
        Long id,
        String title,
        String description,
        EvaluationType evaluationType,
        EvaluationStatus status,
        Double maxScore,
        Double passingScore,
        Double coefficient,
        Double weightPercentage,
        LocalDateTime scheduledAt,
        Integer durationMinutes,
        String roomInfo,
        String instructions,
        String semester,
        LocalDateTime resultsPublishedAt,
        Long courseId,
        String courseTitle,
        String courseCode,
        Long academicYearId,
        String academicYearName,
        Long cohortId,
        String cohortName,
        Long classRoomId,
        String classRoomName,
        Long createdByUserId,
        Long totalStudents,
        Long gradedStudents,
        Double averageScore,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy
) {}
