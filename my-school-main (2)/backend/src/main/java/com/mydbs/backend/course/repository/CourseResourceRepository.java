package com.mydbs.backend.course.repository;

import com.mydbs.backend.course.model.CourseResource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseResourceRepository extends JpaRepository<CourseResource, Long> {

    List<CourseResource> findByCourseIdAndArchivedFalseOrderByCreatedAtDesc(Long courseId);
}