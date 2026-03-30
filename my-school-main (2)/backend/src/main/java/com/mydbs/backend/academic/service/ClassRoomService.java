package com.mydbs.backend.academic.service;

import com.mydbs.backend.academic.dto.ClassRoomCreateRequest;
import com.mydbs.backend.academic.dto.ClassRoomResponse;
import com.mydbs.backend.academic.dto.ClassRoomUpdateRequest;

import java.util.List;

public interface ClassRoomService {

    ClassRoomResponse create(ClassRoomCreateRequest request);

    List<ClassRoomResponse> getAll();

    ClassRoomResponse getById(Long id);

    ClassRoomResponse update(Long id, ClassRoomUpdateRequest request);

    void archive(Long id);
}