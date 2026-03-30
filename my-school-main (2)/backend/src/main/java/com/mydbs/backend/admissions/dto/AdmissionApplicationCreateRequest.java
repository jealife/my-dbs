package com.mydbs.backend.admissions.dto;

import com.mydbs.backend.admissions.model.ApplicationPriority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AdmissionApplicationCreateRequest(
        @NotBlank(message = "Le prenom est obligatoire")
        String firstName,

        @NotBlank(message = "Le nom est obligatoire")
        String lastName,

        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format email invalide")
        String email,

        String phoneNumber,

        LocalDate dateOfBirth,

        String nationality,

        String gender,

        String addressLine,

        String motivationLetter,

        @NotNull(message = "L'identifiant du programme est obligatoire")
        Long programId,

        @NotNull(message = "L'identifiant de l'annee academique est obligatoire")
        Long academicYearId,

        ApplicationPriority priority
) {}
