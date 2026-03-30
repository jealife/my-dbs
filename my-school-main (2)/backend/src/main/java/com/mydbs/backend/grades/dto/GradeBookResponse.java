package com.mydbs.backend.grades.dto;

import java.util.List;

public record GradeBookResponse(
        Long id,
        Long studentId,
        String studentFirstName,
        String studentLastName,
        String studentNumber,
        Long courseId,
        String courseTitle,
        String courseCode,
        Integer courseCredits,
        Long academicYearId,
        String academicYearName,
        String semester,
        Double weightedAverage,
        Double coefficient,
        Integer credits,
        boolean validated,
        Double passingGrade,
        String teacherAppreciation,
        List<GradeItemResponse> items,
        java.time.LocalDateTime createdAt
) {}
