package com.mydbs.backend.evaluation.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RubricCreateRequest(
        @NotBlank(message = "Le nom du critère est obligatoire")
        String criterionName,

        String description,

        @NotNull(message = "Les points maximum sont obligatoires")
        @DecimalMin(value = "0.1")
        Double maxPoints,

        Double weightPercentage,

        Integer orderIndex
) {}
