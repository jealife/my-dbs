package com.mydbs.backend.ue.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TeachingUnitRequest(
        @NotBlank(message = "Le code de l'UE est obligatoire")
        String code,

        @NotBlank(message = "Le nom de l'UE est obligatoire")
        String name,

        String description,

        @NotBlank(message = "Le semestre est obligatoire (S1-S6)")
        String semester,

        Integer orderIndex,

        @NotNull(message = "Le programme est obligatoire")
        Long programId
) {}
