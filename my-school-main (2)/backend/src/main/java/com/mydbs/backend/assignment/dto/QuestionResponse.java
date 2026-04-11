package com.mydbs.backend.assignment.dto;

import com.mydbs.backend.assignment.model.QuestionType;

import java.util.List;

public record QuestionResponse(
        Long id,
        QuestionType questionType,
        String text,
        String explanation,
        Double points,
        Integer orderIndex,
        List<ChoiceResponse> choices
) {}
