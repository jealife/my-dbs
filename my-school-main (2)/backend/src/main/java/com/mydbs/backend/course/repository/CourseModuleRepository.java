package com.mydbs.backend.course.repository;

import com.mydbs.backend.course.model.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {

    List<CourseModule> findByCourseIdAndArchivedFalseOrderByDisplayOrderAsc(Long courseId);
}