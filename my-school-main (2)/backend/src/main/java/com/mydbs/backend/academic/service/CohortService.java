package com.mydbs.backend.academic.service;

import com.mydbs.backend.academic.dto.CohortCreateRequest;
import com.mydbs.backend.academic.dto.CohortResponse;
import com.mydbs.backend.academic.dto.CohortUpdateRequest;

import java.util.List;

public interface CohortService {

    CohortResponse create(CohortCreateRequest request);

    List<CohortResponse> getAll();

    CohortResponse getById(Long id);

    CohortResponse update(Long id, CohortUpdateRequest request);

    void archive(Long id);
}