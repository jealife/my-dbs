package com.mydbs.backend.assignment.dto;

import com.mydbs.backend.assignment.model.SubmissionStatus;

import java.time.LocalDateTime;

public record SubmissionResponse(
        Long id,
        Long assignmentId,
        String assignmentTitle,
        Long studentId,
        String studentFirstName,
        String studentLastName,
        String studentNumber,
        SubmissionStatus status,
        String content,
        String fileName,
        String filePath,
        Long fileSizeBytes,
        Integer versionNumber,
        boolean latest,
        boolean late,
        LocalDateTime submittedAt,
        Double score,
        Double finalScore,
        Double maxScore,
        String teacherFeedback,
        LocalDateTime gradedAt,
        LocalDateTime returnedAt,
        LocalDateTime createdAt
) {}
