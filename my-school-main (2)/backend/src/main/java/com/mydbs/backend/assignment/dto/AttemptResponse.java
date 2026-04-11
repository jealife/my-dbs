package com.mydbs.backend.assignment.dto;

import java.time.LocalDateTime;
import java.util.List;

public record AttemptResponse(
        Long id,
        Long quizId,
        Long assignmentId,
        String assignmentTitle,
        Long studentId,
        String studentFirstName,
        String studentLastName,
        Integer attemptNumber,
        boolean submitted,
        LocalDateTime startedAt,
        LocalDateTime submittedAt,
        Integer timeTakenMinutes,
        Double score,
        Double maxScore,
        Double scorePercentage,
        Boolean passed,
        List<AnswerDetail> answers,
        LocalDateTime createdAt
) {
    public record AnswerDetail(
            Long questionId,
            String questionText,
            String answerValue,
            Boolean correct,
            Double pointsEarned
    ) {}
}
