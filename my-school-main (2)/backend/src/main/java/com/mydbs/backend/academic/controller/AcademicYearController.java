package com.mydbs.backend.academic.controller;

import com.mydbs.backend.academic.dto.AcademicYearCreateRequest;
import com.mydbs.backend.academic.dto.AcademicYearResponse;
import com.mydbs.backend.academic.dto.AcademicYearUpdateRequest;
import com.mydbs.backend.academic.service.AcademicYearService;
import com.mydbs.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academic-years")
@CrossOrigin(origins = "*")
public class AcademicYearController {

    private final AcademicYearService academicYearService;

    public AcademicYearController(AcademicYearService academicYearService) {
        this.academicYearService = academicYearService;
    }

    @PostMapping
    public ApiResponse<AcademicYearResponse> create(@Valid @RequestBody AcademicYearCreateRequest request) {
        return ApiResponse.success("Annee academique creee avec succes", academicYearService.create(request));
    }

    @GetMapping
    public ApiResponse<List<AcademicYearResponse>> getAll() {
        return ApiResponse.success("Liste des annees academiques recuperee avec succes", academicYearService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<AcademicYearResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Annee academique recuperee avec succes", academicYearService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<AcademicYearResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody AcademicYearUpdateRequest request) {
        return ApiResponse.success("Annee academique mise a jour avec succes", academicYearService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        academicYearService.archive(id);
        return ApiResponse.success("Annee academique archivee avec succes", null);
    }
}