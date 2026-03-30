package com.mydbs.backend.assignment.dto;

public record ChoiceResponse(
        Long id,
        String text,
        Integer orderIndex
        // isCorrect exclus de la réponse publique — visible uniquement après soumission
) {}
