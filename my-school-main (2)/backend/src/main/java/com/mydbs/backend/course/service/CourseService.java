package com.mydbs.backend.course.service;

import com.mydbs.backend.course.dto.CourseCreateRequest;
import com.mydbs.backend.course.dto.CoursePublishResponse;
import com.mydbs.backend.course.dto.CourseResponse;
import com.mydbs.backend.course.dto.CourseUpdateRequest;

import java.util.List;

public interface CourseService {

    CourseResponse create(CourseCreateRequest request);

    List<CourseResponse> getAll();

    CourseResponse getById(Long id);

    CourseResponse update(Long id, CourseUpdateRequest request);

    CoursePublishResponse publish(Long id);

    CoursePublishResponse unpublish(Long id);

    void archive(Long id);
}