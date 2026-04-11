package com.mydbs.backend.teacher.dto;

import com.mydbs.backend.teacher.model.EmploymentType;
import com.mydbs.backend.teacher.model.TeacherStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record TeacherResponse(
        Long id,
        String teacherNumber,
        String employeeNumber,
        String firstName,
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
        boolean remoteAvailable,
        TeacherStatus status,
        EmploymentType employmentType,
        Long userId,
        String userEmail,
        Long academicYearId,
        String academicYearName,
        Long programId,
        String programName,
        Long classRoomId,
        String classRoomName,
        List<TeacherQualificationResponse> qualifications,
        List<TeacherSpecializationResponse> specializations,
        List<TeacherStatusHistoryResponse> statusHistory,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String updatedBy
) {
}