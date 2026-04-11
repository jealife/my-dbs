package com.mydbs.backend.admissions.dto;

import com.mydbs.backend.admissions.model.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record AdmissionStatusChangeRequest(
        @NotNull(message = "Le statut cible est obligatoire")
        ApplicationStatus targetStatus,

        String reason,

        Long cohortId
) {}
