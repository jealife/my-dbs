package com.mydbs.backend.teacher.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.teacher.dto.TeacherCreateRequest;
import com.mydbs.backend.teacher.dto.TeacherResponse;
import com.mydbs.backend.teacher.dto.TeacherStatusUpdateRequest;
import com.mydbs.backend.teacher.dto.TeacherUpdateRequest;
import com.mydbs.backend.teacher.service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "*")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @PostMapping
    public ApiResponse<TeacherResponse> create(@Valid @RequestBody TeacherCreateRequest request) {
        return ApiResponse.success("Enseignant cree avec succes", teacherService.create(request));
    }

    @GetMapping
    public ApiResponse<List<TeacherResponse>> getAll() {
        return ApiResponse.success("Liste des enseignants recuperee avec succes", teacherService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<TeacherResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Enseignant recupere avec succes", teacherService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<TeacherResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody TeacherUpdateRequest request) {
        return ApiResponse.success("Enseignant mis a jour avec succes", teacherService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<TeacherResponse> updateStatus(@PathVariable Long id,
                                                     @Valid @RequestBody TeacherStatusUpdateRequest request) {
        return ApiResponse.success("Statut de l'enseignant mis a jour avec succes", teacherService.updateStatus(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        teacherService.archive(id);
        return ApiResponse.success("Enseignant archive avec succes", null);
    }
}