package com.mydbs.backend.grades.dto;

import com.mydbs.backend.grades.model.GradeItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GradeItemCreateRequest(
        @NotNull Long gradeBookId,
        @NotNull GradeItemType itemType,
        Long sourceId,
        @NotBlank String label,
        @NotNull Double score,
        Double maxScore,
        Double coefficient,
        String semester,
        String teacherComment
) {}
