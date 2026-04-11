package com.mydbs.backend.academic.dto;

import com.mydbs.backend.academic.model.ClassRoomStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ClassRoomUpdateRequest(
        @NotBlank(message = "Le nom est obligatoire")
        String name,

        @NotBlank(message = "Le code est obligatoire")
        String code,

        String description,
        Integer capacity,

        @NotBlank(message = "Le mode de diffusion est obligatoire")
        String deliveryMode,

        String roomLabel,

        @NotNull(message = "L'annee academique est obligatoire")
        Long academicYearId,

        @NotNull(message = "Le programme est obligatoire")
        Long programId,

        Long cohortId,

        @NotNull(message = "Le statut est obligatoire")
        ClassRoomStatus status
) {
}