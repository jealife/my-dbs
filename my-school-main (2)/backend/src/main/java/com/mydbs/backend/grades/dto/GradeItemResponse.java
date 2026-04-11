package com.mydbs.backend.grades.dto;

import com.mydbs.backend.grades.model.GradeItemType;

import java.time.LocalDateTime;

public record GradeItemResponse(
        Long id,
        Long gradeBookId,
        GradeItemType itemType,
        Long sourceId,
        String label,
        Double score,
        Double maxScore,
        Double scoreOn20,         // score normalisé sur 20
        String semester,
        String teacherComment,
        LocalDateTime createdAt
) {}
