package com.mydbs.backend.assignment.dto;

import com.mydbs.backend.assignment.model.AssignmentType;

import java.time.LocalDateTime;

public record AssignmentResponse(
        Long id,
        String title,
        String description,
        String instructions,
        AssignmentType assignmentType,
        Double maxScore,
        Double passingScore,
        LocalDateTime dueDate,
        LocalDateTime availableFrom,
        boolean allowLateSubmission,
        Double latePenaltyPercent,
        Integer maxAttempts,
        boolean published,
        boolean resultsPublished,
        String semester,
        Long courseId,
        String courseTitle,
        String courseCode,
        Long academicYearId,
        String academicYearName,
        Long cohortId,
        String cohortName,
        long totalSubmissions,
        long gradedSubmissions,
        LocalDateTime createdAt,
        String createdBy
) {}
