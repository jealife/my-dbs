package com.mydbs.backend.evaluation.dto;

import com.mydbs.backend.evaluation.model.ResultStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record GradeEntryRequest(
        @NotNull(message = "L'identifiant de l'étudiant est obligatoire")
        Long studentId,

        Double score,

        ResultStatus status,

        String teacherComment
) {}
