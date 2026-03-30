package com.mydbs.backend.assignment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record QuestionCreateRequest(
        @NotNull String questionType,
        @NotBlank String text,
        String explanation,
        Double points,
        Integer orderIndex,
        String expectedAnswer
) {}
