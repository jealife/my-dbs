package com.mydbs.backend.course.repository;

import com.mydbs.backend.course.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByCourseModuleIdAndArchivedFalseOrderByDisplayOrderAsc(Long courseModuleId);
}