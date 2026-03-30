package com.mydbs.backend.academic.controller;

import com.mydbs.backend.academic.dto.ClassRoomCreateRequest;
import com.mydbs.backend.academic.dto.ClassRoomResponse;
import com.mydbs.backend.academic.dto.ClassRoomUpdateRequest;
import com.mydbs.backend.academic.service.ClassRoomService;
import com.mydbs.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "*")
public class ClassRoomController {

    private final ClassRoomService classRoomService;

    public ClassRoomController(ClassRoomService classRoomService) {
        this.classRoomService = classRoomService;
    }

    @PostMapping
    public ApiResponse<ClassRoomResponse> create(@Valid @RequestBody ClassRoomCreateRequest request) {
        return ApiResponse.success("Classe creee avec succes", classRoomService.create(request));
    }

    @GetMapping
    public ApiResponse<List<ClassRoomResponse>> getAll() {
        return ApiResponse.success("Liste des classes recuperee avec succes", classRoomService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<ClassRoomResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Classe recuperee avec succes", classRoomService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<ClassRoomResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody ClassRoomUpdateRequest request) {
        return ApiResponse.success("Classe mise a jour avec succes", classRoomService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        classRoomService.archive(id);
        return ApiResponse.success("Classe archivee avec succes", null);
    }
}