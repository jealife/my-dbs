package com.mydbs.backend.assignment.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record QuizSubmitRequest(
        @NotNull(message = "La liste des réponses est obligatoire")
        List<AnswerRequest> answers
) {
    public record AnswerRequest(
            @NotNull Long questionId,
            String answerValue  // IDs séparés par virgule pour QCM, "true"/"false", ou texte libre
    ) {}
}
