package com.mydbs.backend.student.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EmergencyContactRequest(
        @NotBlank(message = "Le nom complet du contact d'urgence est obligatoire")
        String fullName,
        @NotBlank(message = "Le lien est obligatoire")
        String relationshipLabel,
        @NotBlank(message = "Le numero de telephone est obligatoire")
        String phoneNumber,
        String secondaryPhoneNumber,
        String email,
        String addressLine,
        @NotNull(message = "L'ordre de priorite est obligatoire")
        Integer priorityOrder
) {
}