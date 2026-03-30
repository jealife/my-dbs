package com.mydbs.backend.assignment.dto;

import jakarta.validation.constraints.NotBlank;

public record ChoiceCreateRequest(
        @NotBlank String text,
        boolean correct,
        Integer orderIndex
) {}
