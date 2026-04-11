package com.mydbs.backend.course.dto;

import java.util.List;

public record CourseProgressResponse(
        boolean enrolled,
        int completionPercent,
        List<Long> completedLessons,
        long totalLessons
) {}
