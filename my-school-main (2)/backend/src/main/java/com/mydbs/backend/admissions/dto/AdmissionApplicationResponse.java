package com.mydbs.backend.admissions.dto;

import com.mydbs.backend.admissions.model.ApplicationPriority;
import com.mydbs.backend.admissions.model.ApplicationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record AdmissionApplicationResponse(
        Long id,
        String applicationNumber,
        String firstName,
        String lastName,
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
        String motivationLetter,
        // Parents
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
        // Parcours académique
        String entryLevel,
        String previousDiplomaYear,
        String previousDiplomaTitle,
        String previousSchool,
        String previousSchoolCity,
        // Statut & admin
        ApplicationStatus status,
        ApplicationPriority priority,
        String rejectionReason,
        String reviewNotes,
        LocalDateTime submittedAt,
        LocalDateTime decidedAt,
        Long programId,
        String programName,
        Long academicYearId,
        String academicYearName,
        Long cohortId,
        String cohortName,
        Long studentId,
        String studentNumber,
        List<SupportingDocumentResponse> documents,
        List<AdmissionNoteResponse> notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String updatedBy
) {}
