package com.mydbs.backend.assignment.dto;

import com.mydbs.backend.assignment.model.AssignmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AssignmentCreateRequest(
        @NotBlank(message = "Le titre est obligatoire")
        String title,

        String description,
        String instructions,

        @NotNull(message = "Le type est obligatoire")
        AssignmentType assignmentType,

        Double maxScore,
        Double passingScore,
        Double coefficient,

        @NotNull(message = "La date limite est obligatoire")
        LocalDateTime dueDate,

        LocalDateTime availableFrom,
        boolean allowLateSubmission,
        Double latePenaltyPercent,
        Integer maxAttempts,
        String semester,

        @NotNull(message = "Le cours est obligatoire")
        Long courseId,

        @NotNull(message = "L'année académique est obligatoire")
        Long academicYearId,

        Long cohortId
) {}
