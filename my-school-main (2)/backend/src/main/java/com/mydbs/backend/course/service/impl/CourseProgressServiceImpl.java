package com.mydbs.backend.course.service.impl;

import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.course.dto.CourseProgressResponse;
import com.mydbs.backend.course.model.Course;
import com.mydbs.backend.course.model.Lesson;
import com.mydbs.backend.course.model.StudentLessonProgress;
import com.mydbs.backend.course.repository.CourseRepository;
import com.mydbs.backend.course.repository.LessonRepository;
import com.mydbs.backend.course.repository.StudentLessonProgressRepository;
import com.mydbs.backend.course.service.CourseProgressService;
import com.mydbs.backend.user.model.User;
import com.mydbs.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CourseProgressServiceImpl implements CourseProgressService {

    private final StudentLessonProgressRepository progressRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

    public CourseProgressServiceImpl(StudentLessonProgressRepository progressRepository,
                                     CourseRepository courseRepository,
                                     LessonRepository lessonRepository,
                                     UserRepository userRepository) {
        this.progressRepository = progressRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.userRepository = userRepository;
    }

    @Override
    public CourseProgressResponse enroll(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable avec l'id: " + courseId));
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'id: " + userId));

        // Enrollment is tracked implicitly via progress records; return current progress
        return buildProgressResponse(courseId, userId, course);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseProgressResponse getProgress(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable avec l'id: " + courseId));
        return buildProgressResponse(courseId, userId, course);
    }

    @Override
    public CourseProgressResponse markLessonComplete(Long courseId, Long lessonId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable avec l'id: " + courseId));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Leçon introuvable avec l'id: " + lessonId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'id: " + userId));

        if (!progressRepository.existsByUserIdAndLessonId(userId, lessonId)) {
            StudentLessonProgress progress = new StudentLessonProgress();
            progress.setUser(user);
            progress.setLesson(lesson);
            progress.setCourse(course);
            progressRepository.save(progress);
        }

        return buildProgressResponse(courseId, userId, course);
    }

    private CourseProgressResponse buildProgressResponse(Long courseId, Long userId, Course course) {
        List<StudentLessonProgress> completed = progressRepository.findByUserIdAndCourseId(userId, courseId);
        long total = progressRepository.countLessonsByCourseId(courseId);
        List<Long> completedIds = completed.stream()
                .map(p -> p.getLesson().getId())
                .toList();
        boolean enrolled = !completed.isEmpty() || progressRepository.existsByUserIdAndCourseId(userId, courseId);
        int percent = total == 0 ? 0 : (int) Math.round((completedIds.size() * 100.0) / total);
        return new CourseProgressResponse(enrolled, percent, completedIds, total);
    }
}
