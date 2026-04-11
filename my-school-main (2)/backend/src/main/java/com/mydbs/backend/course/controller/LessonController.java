package com.mydbs.backend.course.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.course.dto.LessonCreateRequest;
import com.mydbs.backend.course.dto.LessonResponse;
import com.mydbs.backend.course.dto.LessonUpdateRequest;
import com.mydbs.backend.course.service.LessonService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@CrossOrigin(origins = "*")
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @PostMapping("/module/{moduleId}")
    public ApiResponse<LessonResponse> create(@PathVariable Long moduleId,
                                              @Valid @RequestBody LessonCreateRequest request) {
        return ApiResponse.success("Lecon creee avec succes", lessonService.create(moduleId, request));
    }

    @GetMapping("/module/{moduleId}")
    public ApiResponse<List<LessonResponse>> getByModule(@PathVariable Long moduleId) {
        return ApiResponse.success("Liste des lecons recuperee avec succes", lessonService.getByModule(moduleId));
    }

    @PutMapping("/{id}")
    public ApiResponse<LessonResponse> update(@PathVariable Long id,
                                              @Valid @RequestBody LessonUpdateRequest request) {
        return ApiResponse.success("Lecon mise a jour avec succes", lessonService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        lessonService.archive(id);
        return ApiResponse.success("Lecon archivee avec succes", null);
    }
}