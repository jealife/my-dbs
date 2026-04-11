package com.mydbs.backend.course.service;

import com.mydbs.backend.course.dto.CourseProgressResponse;

public interface CourseProgressService {

    CourseProgressResponse enroll(Long courseId, Long userId);

    CourseProgressResponse getProgress(Long courseId, Long userId);

    CourseProgressResponse markLessonComplete(Long courseId, Long lessonId, Long userId);
}
