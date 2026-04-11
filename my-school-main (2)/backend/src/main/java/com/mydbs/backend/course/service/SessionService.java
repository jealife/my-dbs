package com.mydbs.backend.course.service;

import com.mydbs.backend.course.dto.SessionCreateRequest;
import com.mydbs.backend.course.dto.SessionResponse;
import com.mydbs.backend.course.dto.SessionUpdateRequest;

import java.util.List;

public interface SessionService {

    SessionResponse create(Long courseId, SessionCreateRequest request);

    List<SessionResponse> getByCourse(Long courseId);

    SessionResponse update(Long id, SessionUpdateRequest request);

    void archive(Long id);
}