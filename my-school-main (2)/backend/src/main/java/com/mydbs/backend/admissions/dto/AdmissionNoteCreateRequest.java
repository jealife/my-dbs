package com.mydbs.backend.admissions.dto;

import jakarta.validation.constraints.NotBlank;

public record AdmissionNoteCreateRequest(
        @NotBlank(message = "Le contenu de la note est obligatoire")
        String content,

        boolean internalOnly
) {}
