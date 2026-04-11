package com.mydbs.backend.course.service;

import com.mydbs.backend.course.dto.LessonCreateRequest;
import com.mydbs.backend.course.dto.LessonResponse;
import com.mydbs.backend.course.dto.LessonUpdateRequest;

import java.util.List;

public interface LessonService {

    LessonResponse create(Long moduleId, LessonCreateRequest request);

    List<LessonResponse> getByModule(Long moduleId);

    LessonResponse update(Long id, LessonUpdateRequest request);

    void archive(Long id);
}