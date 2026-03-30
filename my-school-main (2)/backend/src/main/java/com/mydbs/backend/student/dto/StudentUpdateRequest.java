package com.mydbs.backend.student.dto;

import com.mydbs.backend.student.model.EnrollmentType;
import com.mydbs.backend.student.model.StudentStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record StudentUpdateRequest(
        @NotBlank(message = "Le matricule etudiant est obligatoire")
        String studentNumber,
        String admissionNumber,
        String registrationNumber,

        @NotBlank(message = "Le prenom est obligatoire")
        String firstName,

        @NotBlank(message = "Le nom est obligatoire")
        String lastName,

        String middleName,
        String email,
        String phoneNumber,
        String secondaryPhoneNumber,
        String gender,
        String nationality,
        String cityOfBirth,
        String countryOfBirth,
        LocalDate dateOfBirth,
        String nationalIdNumber,
        String passportNumber,
        String addressLine,
        String city,
        String country,
        String postalCode,
        String photoUrl,
        String medicalNotes,
        String specialNeedsNotes,
        LocalDate admissionDate,
        LocalDate registrationDate,
        LocalDate expectedGraduationDate,
        Boolean scholarshipHolder,
        Boolean internationalStudent,
        Boolean workingStudent,

        @NotNull(message = "L'annee academique est obligatoire")
        Long academicYearId,

        @NotNull(message = "Le programme est obligatoire")
        Long programId,

        Long cohortId,
        Long classRoomId,
        Long userId,

        @NotNull(message = "Le statut est obligatoire")
        StudentStatus status,

        @NotNull(message = "Le type d'inscription est obligatoire")
        EnrollmentType enrollmentType,

        @Valid
        List<GuardianContactRequest> guardians,

        @Valid
        List<EmergencyContactRequest> emergencyContacts
) {
}