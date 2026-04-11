package com.mydbs.backend.student.service;

import com.mydbs.backend.student.dto.StudentCreateRequest;
import com.mydbs.backend.student.dto.StudentResponse;
import com.mydbs.backend.student.dto.StudentStatusUpdateRequest;
import com.mydbs.backend.student.dto.StudentUpdateRequest;

import java.util.List;

public interface StudentService {

    StudentResponse create(StudentCreateRequest request);

    List<StudentResponse> getAll();

    StudentResponse getById(Long id);

    List<StudentResponse> getByClassRoom(Long classRoomId);

    StudentResponse update(Long id, StudentUpdateRequest request);

    StudentResponse updateStatus(Long id, StudentStatusUpdateRequest request);

    void archive(Long id);
}