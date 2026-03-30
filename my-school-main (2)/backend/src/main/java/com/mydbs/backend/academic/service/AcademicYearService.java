package com.mydbs.backend.academic.service;

import com.mydbs.backend.academic.dto.AcademicYearCreateRequest;
import com.mydbs.backend.academic.dto.AcademicYearResponse;
import com.mydbs.backend.academic.dto.AcademicYearUpdateRequest;

import java.util.List;

public interface AcademicYearService {

    AcademicYearResponse create(AcademicYearCreateRequest request);

    List<AcademicYearResponse> getAll();

    AcademicYearResponse getById(Long id);

    AcademicYearResponse update(Long id, AcademicYearUpdateRequest request);

    void archive(Long id);
}