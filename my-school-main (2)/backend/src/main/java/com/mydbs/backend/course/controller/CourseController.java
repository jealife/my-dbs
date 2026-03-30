package com.mydbs.backend.course.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.course.dto.CourseCreateRequest;
import com.mydbs.backend.course.dto.CoursePublishResponse;
import com.mydbs.backend.course.dto.CourseResponse;
import com.mydbs.backend.course.dto.CourseUpdateRequest;
import com.mydbs.backend.course.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    public ApiResponse<CourseResponse> create(@Valid @RequestBody CourseCreateRequest request) {
        return ApiResponse.success("Cours cree avec succes", courseService.create(request));
    }

    @GetMapping
    public ApiResponse<List<CourseResponse>> getAll() {
        return ApiResponse.success("Liste des cours recuperee avec succes", courseService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<CourseResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Cours recupere avec succes", courseService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<CourseResponse> update(@PathVariable Long id,
                                              @Valid @RequestBody CourseUpdateRequest request) {
        return ApiResponse.success("Cours mis a jour avec succes", courseService.update(id, request));
    }

    @PostMapping("/{id}/publish")
    public ApiResponse<CoursePublishResponse> publish(@PathVariable Long id) {
        return ApiResponse.success("Publication effectuee avec succes", courseService.publish(id));
    }

    @PostMapping("/{id}/unpublish")
    public ApiResponse<CoursePublishResponse> unpublish(@PathVariable Long id) {
        return ApiResponse.success("Depublication effectuee avec succes", courseService.unpublish(id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        courseService.archive(id);
        return ApiResponse.success("Cours archive avec succes", null);
    }
}