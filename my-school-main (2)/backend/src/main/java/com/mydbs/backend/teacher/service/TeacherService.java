package com.mydbs.backend.teacher.service;

import com.mydbs.backend.teacher.dto.TeacherCreateRequest;
import com.mydbs.backend.teacher.dto.TeacherResponse;
import com.mydbs.backend.teacher.dto.TeacherStatusUpdateRequest;
import com.mydbs.backend.teacher.dto.TeacherUpdateRequest;

import java.util.List;

public interface TeacherService {

    TeacherResponse create(TeacherCreateRequest request);

    List<TeacherResponse> getAll();

    TeacherResponse getById(Long id);

    List<TeacherResponse> getByProgram(Long programId);

    TeacherResponse update(Long id, TeacherUpdateRequest request);

    TeacherResponse updateStatus(Long id, TeacherStatusUpdateRequest request);

    void archive(Long id);
}