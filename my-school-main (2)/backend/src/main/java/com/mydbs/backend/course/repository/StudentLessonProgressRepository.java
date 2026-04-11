package com.mydbs.backend.course.repository;

import com.mydbs.backend.course.model.StudentLessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentLessonProgressRepository extends JpaRepository<StudentLessonProgress, Long> {

    List<StudentLessonProgress> findByUserIdAndCourseId(Long userId, Long courseId);

    boolean existsByUserIdAndLessonId(Long userId, Long lessonId);

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.courseModule.course.id = :courseId AND l.archived = false")
    long countLessonsByCourseId(@Param("courseId") Long courseId);
}
