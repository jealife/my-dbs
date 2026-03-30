package com.mydbs.backend.course.dto;

import com.mydbs.backend.course.model.CourseStatus;
import com.mydbs.backend.course.model.CourseVisibility;

import java.time.LocalDateTime;

public record CourseResponse(
        Long id,
        String title,
        String code,
        String courseSheet,
        String objectives,
        String prerequisites,
        String syllabus,
        String description,
        Integer credits,
        Double coefficient,
        Integer totalHours,
        boolean published,
        Integer currentVersionNumber,
        CourseStatus status,
        CourseVisibility visibility,
        Long academicYearId,
        String academicYearName,
        Long programId,
        String programName,
        Long classRoomId,
        String classRoomName,
        Long instructorUserId,
        String instructorDisplayName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String updatedBy
) {
}