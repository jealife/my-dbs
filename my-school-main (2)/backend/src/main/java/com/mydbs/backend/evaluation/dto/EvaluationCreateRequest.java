package com.mydbs.backend.evaluation.dto;

import com.mydbs.backend.evaluation.model.EvaluationType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record EvaluationCreateRequest(
        @NotBlank(message = "Le titre est obligatoire")
        String title,

        String description,

        @NotNull(message = "Le type d'évaluation est obligatoire")
        EvaluationType evaluationType,

        @NotNull(message = "La note maximale est obligatoire")
        @DecimalMin(value = "1.0", message = "La note maximale doit être au moins 1")
        Double maxScore,

        Double passingScore,

        Double weightPercentage,

        LocalDateTime scheduledAt,
        Integer durationMinutes,
        String roomInfo,
        String instructions,
        String semester,

        @NotNull(message = "L'identifiant du cours est obligatoire")
        Long courseId,

        @NotNull(message = "L'identifiant de l'année académique est obligatoire")
        Long academicYearId,

        Long cohortId,
        Long classRoomId
) {}
