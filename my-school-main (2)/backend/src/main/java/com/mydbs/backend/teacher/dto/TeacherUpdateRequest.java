package com.mydbs.backend.teacher.dto;

import com.mydbs.backend.teacher.model.EmploymentType;
import com.mydbs.backend.teacher.model.TeacherStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record TeacherUpdateRequest(
        @NotBlank(message = "Le matricule enseignant est obligatoire")
        String teacherNumber,
        String employeeNumber,

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
        LocalDate dateOfBirth,
        String nationalIdNumber,
        String passportNumber,
        String addressLine,
        String city,
        String country,
        String postalCode,
        String photoUrl,
        String bio,
        String specialNotes,
        LocalDate hireDate,
        LocalDate endContractDate,
        String officeLocation,
        String officeHours,
        String highestDegree,
        Integer yearsOfExperience,
        Integer teachingHoursQuota,
        Boolean remoteAvailable,

        @NotNull(message = "L'annee academique est obligatoire")
        Long academicYearId,

        @NotNull(message = "Le programme est obligatoire")
        Long programId,

        Long classRoomId,
        Long userId,

        @NotNull(message = "Le statut est obligatoire")
        TeacherStatus status,

        @NotNull(message = "Le type d'emploi est obligatoire")
        EmploymentType employmentType,

        @Valid
        List<TeacherQualificationRequest> qualifications,

        @Valid
        List<TeacherSpecializationRequest> specializations
) {
}