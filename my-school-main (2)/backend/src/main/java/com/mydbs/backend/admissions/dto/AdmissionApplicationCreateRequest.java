package com.mydbs.backend.admissions.dto;

import com.mydbs.backend.admissions.model.ApplicationPriority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record AdmissionApplicationCreateRequest(
        // ── État civil ───────────────────────────────────────────────────────
        @NotBlank(message = "Le prenom est obligatoire")
        String firstName,

        @NotBlank(message = "Le nom est obligatoire")
        String lastName,

        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format email invalide")
        String email,

        String phoneNumber,
        LocalDate dateOfBirth,
        String gender,
        String cityOfBirth,
        String countryOfBirth,
        String department,
        String postalCode,
        String nationality,
        String addressLine,

        // ── Parents ──────────────────────────────────────────────────────────
        String fatherName,
        String fatherProfession,
        String fatherCompany,
        String fatherAddress,
        String fatherCity,
        String fatherPhone,

        String motherName,
        String motherProfession,
        String motherCompany,
        String motherAddress,
        String motherCity,
        String motherPhone,

        // ── Parcours académique ──────────────────────────────────────────────
        String entryLevel,
        String previousDiplomaYear,
        String previousDiplomaTitle,
        String previousSchool,
        String previousSchoolCity,

        String motivationLetter,

        // ── Références ───────────────────────────────────────────────────────
        Long programId,
        Long academicYearId,
        ApplicationPriority priority
) {}
