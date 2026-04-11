package com.mydbs.backend.grades.dto;

import com.mydbs.backend.grades.model.BulletinStatus;

import java.time.LocalDateTime;
import java.util.List;

public record BulletinResponse(
        Long id,
        Long studentId,
        String studentFirstName,
        String studentLastName,
        String studentNumber,
        Long academicYearId,
        String academicYearName,
        Long cohortId,
        String cohortName,
        String semester,
        BulletinStatus status,
        Double generalAverage,
        Integer totalCreditsAcquired,
        Integer totalCreditsPossible,
        Integer rankInCohort,
        Integer totalStudentsInCohort,
        Double classAverage,
        Double highestAverage,
        Double lowestAverage,
        String headTeacherComment,
        String councilDecision,
        LocalDateTime publishedAt,
        /** Vue à plat (rétrocompatibilité) */
        List<GradeBookResponse> gradeBooks,
        /** Vue groupée par UE — système LMD */
        List<UeGradeGroupResponse> ueGroups,
        LocalDateTime createdAt
) {}
