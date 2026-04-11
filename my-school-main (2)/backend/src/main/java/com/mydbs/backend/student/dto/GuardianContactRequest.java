package com.mydbs.backend.student.dto;

import jakarta.validation.constraints.NotBlank;

public record GuardianContactRequest(
        @NotBlank(message = "Le nom complet du tuteur est obligatoire")
        String fullName,
        @NotBlank(message = "Le lien de parenté est obligatoire")
        String relationshipLabel,
        @NotBlank(message = "Le numero de telephone est obligatoire")
        String phoneNumber,
        String secondaryPhoneNumber,
        String email,
        String addressLine,
        String city,
        String country,
        Boolean primaryContact
) {
}