package com.mydbs.backend.attendance.dto;

public record AttendanceStatsResponse(
        Long studentId,
        String studentFirstName,
        String studentLastName,
        String studentNumber,
        Long courseId,
        String courseTitle,
        long totalSessions,
        long presentSessions,
        long absentSessions,
        long lateSessions,
        long excusedSessions,
        double attendanceRate,       // (present + late + excused) / total * 100
        boolean belowThreshold,      // true si attendanceRate < seuilAlerte (défaut 75%)
        String alertMessage
) {}
