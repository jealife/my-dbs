package com.mydbs.backend.course.repository;

import com.mydbs.backend.course.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {

    boolean existsByCodeIgnoreCase(String code);

    Optional<Course> findByCodeIgnoreCase(String code);

    List<Course> findByArchivedFalseOrderByTitleAsc();
}