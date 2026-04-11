package com.mydbs.backend.course.dto;

import jakarta.validation.constraints.NotNull;

public record EnrollRequest(
        @NotNull(message = "L'identifiant de l'utilisateur est obligatoire")
        Long userId
) {}
