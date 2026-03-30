package com.mydbs.backend.admissions.dto;

import com.mydbs.backend.admissions.model.ApplicationPriority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record AdmissionApplicationUpdateRequest(
        @NotBlank(message = "Le prenom est obligatoire")
        String firstName,

        @NotBlank(message = "Le nom est obligatoire")
        String lastName,

        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format email invalide")
        String email,

        String phoneNumber,
        String secondaryPhoneNumber,
        String middleName,
        LocalDate dateOfBirth,
        String nationality,
        String gender,
        String cityOfBirth,
        String countryOfBirth,
        String nationalIdNumber,
        String passportNumber,
        String addressLine,
        String city,
        String country,
        String postalCode,
        String motivationLetter,
        ApplicationPriority priority
) {}
