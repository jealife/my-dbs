package com.mydbs.backend.course.dto;

import com.mydbs.backend.course.model.CourseStatus;
import com.mydbs.backend.course.model.CourseVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CourseUpdateRequest(
        @NotBlank(message = "Le titre est obligatoire")
        String title,

        @NotBlank(message = "Le code est obligatoire")
        String code,

        String courseSheet,
        String objectives,
        String prerequisites,
        String syllabus,
        String description,

        @NotNull(message = "Les credits sont obligatoires")
        Integer credits,

        @NotNull(message = "Le coefficient est obligatoire")
        Double coefficient,

        @NotNull(message = "Le volume horaire est obligatoire")
        Integer totalHours,

        @NotNull(message = "L'annee academique est obligatoire")
        Long academicYearId,

        @NotNull(message = "Le programme est obligatoire")
        Long programId,

        Long classRoomId,
        Long instructorUserId,

        @NotNull(message = "Le statut est obligatoire")
        CourseStatus status,

        @NotNull(message = "La visibilite est obligatoire")
        CourseVisibility visibility
) {
}