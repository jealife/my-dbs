package com.mydbs.backend.academic.service;

import com.mydbs.backend.academic.dto.ProgramCreateRequest;
import com.mydbs.backend.academic.dto.ProgramResponse;
import com.mydbs.backend.academic.dto.ProgramUpdateRequest;

import java.util.List;

public interface ProgramService {

    ProgramResponse create(ProgramCreateRequest request);

    List<ProgramResponse> getAll();

    ProgramResponse getById(Long id);

    ProgramResponse update(Long id, ProgramUpdateRequest request);

    void archive(Long id);
}