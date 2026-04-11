package com.mydbs.backend.academic.controller;

import com.mydbs.backend.academic.dto.CohortCreateRequest;
import com.mydbs.backend.academic.dto.CohortResponse;
import com.mydbs.backend.academic.dto.CohortUpdateRequest;
import com.mydbs.backend.academic.service.CohortService;
import com.mydbs.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cohorts")
@CrossOrigin(origins = "*")
public class CohortController {

    private final CohortService cohortService;

    public CohortController(CohortService cohortService) {
        this.cohortService = cohortService;
    }

    @PostMapping
    public ApiResponse<CohortResponse> create(@Valid @RequestBody CohortCreateRequest request) {
        return ApiResponse.success("Cohorte creee avec succes", cohortService.create(request));
    }

    @GetMapping
    public ApiResponse<List<CohortResponse>> getAll() {
        return ApiResponse.success("Liste des cohortes recuperee avec succes", cohortService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<CohortResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Cohorte recuperee avec succes", cohortService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<CohortResponse> update(@PathVariable Long id,
                                              @Valid @RequestBody CohortUpdateRequest request) {
        return ApiResponse.success("Cohorte mise a jour avec succes", cohortService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        cohortService.archive(id);
        return ApiResponse.success("Cohorte archivee avec succes", null);
    }
}