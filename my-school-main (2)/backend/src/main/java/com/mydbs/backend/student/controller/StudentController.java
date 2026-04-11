package com.mydbs.backend.student.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.student.dto.StudentCreateRequest;
import com.mydbs.backend.student.dto.StudentResponse;
import com.mydbs.backend.student.dto.StudentStatusUpdateRequest;
import com.mydbs.backend.student.dto.StudentUpdateRequest;
import com.mydbs.backend.student.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    public ApiResponse<StudentResponse> create(@Valid @RequestBody StudentCreateRequest request) {
        return ApiResponse.success("Etudiant cree avec succes", studentService.create(request));
    }

    @GetMapping
    public ApiResponse<List<StudentResponse>> getAll() {
        return ApiResponse.success("Liste des etudiants recuperee avec succes", studentService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<StudentResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Etudiant recupere avec succes", studentService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<StudentResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody StudentUpdateRequest request) {
        return ApiResponse.success("Etudiant mis a jour avec succes", studentService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<StudentResponse> updateStatus(@PathVariable Long id,
                                                     @Valid @RequestBody StudentStatusUpdateRequest request) {
        return ApiResponse.success("Statut de l'etudiant mis a jour avec succes", studentService.updateStatus(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        studentService.archive(id);
        return ApiResponse.success("Etudiant archive avec succes", null);
    }
}