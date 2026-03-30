package com.mydbs.backend.academic.controller;

import com.mydbs.backend.academic.dto.ProgramCreateRequest;
import com.mydbs.backend.academic.dto.ProgramResponse;
import com.mydbs.backend.academic.dto.ProgramUpdateRequest;
import com.mydbs.backend.academic.service.ProgramService;
import com.mydbs.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/programs")
@CrossOrigin(origins = "*")
public class ProgramController {

    private final ProgramService programService;

    public ProgramController(ProgramService programService) {
        this.programService = programService;
    }

    @PostMapping
    public ApiResponse<ProgramResponse> create(@Valid @RequestBody ProgramCreateRequest request) {
        return ApiResponse.success("Programme cree avec succes", programService.create(request));
    }

    @GetMapping
    public ApiResponse<List<ProgramResponse>> getAll() {
        return ApiResponse.success("Liste des programmes recuperee avec succes", programService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<ProgramResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Programme recupere avec succes", programService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProgramResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody ProgramUpdateRequest request) {
        return ApiResponse.success("Programme mis a jour avec succes", programService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        programService.archive(id);
        return ApiResponse.success("Programme archive avec succes", null);
    }
}