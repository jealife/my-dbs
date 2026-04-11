package com.mydbs.backend.grades.dto;

import java.util.List;

/**
 * Regroupement des notes par Unité d'Enseignement (UE) dans un bulletin LMD.
 * Chaque UE contient plusieurs carnets de notes (un par cours/matière).
 */
public record UeGradeGroupResponse(
        Long   ueId,
        String ueCode,
        String ueName,
        String semester,
        Integer ueOrderIndex,
        List<GradeBookResponse> courses
) {}
