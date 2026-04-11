package com.mydbs.backend.course.service;

import com.mydbs.backend.course.dto.CourseModuleCreateRequest;
import com.mydbs.backend.course.dto.CourseModuleResponse;
import com.mydbs.backend.course.dto.CourseModuleUpdateRequest;

import java.util.List;

public interface CourseModuleService {

    CourseModuleResponse create(Long courseId, CourseModuleCreateRequest request);

    List<CourseModuleResponse> getByCourse(Long courseId);

    CourseModuleResponse update(Long id, CourseModuleUpdateRequest request);

    void archive(Long id);
}