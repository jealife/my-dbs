package com.mydbs.backend.course.repository;

import com.mydbs.backend.course.model.CourseVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseVersionRepository extends JpaRepository<CourseVersion, Long> {

    List<CourseVersion> findByCourseIdOrderByVersionNumberDesc(Long courseId);
}