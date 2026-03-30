package com.mydbs.backend.course.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.course.dto.CourseModuleCreateRequest;
import com.mydbs.backend.course.dto.CourseModuleResponse;
import com.mydbs.backend.course.dto.CourseModuleUpdateRequest;
import com.mydbs.backend.course.service.CourseModuleService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course-modules")
@CrossOrigin(origins = "*")
public class CourseModuleController {

    private final CourseModuleService courseModuleService;

    public CourseModuleController(CourseModuleService courseModuleService) {
        this.courseModuleService = courseModuleService;
    }

    @PostMapping("/course/{courseId}")
    public ApiResponse<CourseModuleResponse> create(@PathVariable Long courseId,
                                                    @Valid @RequestBody CourseModuleCreateRequest request) {
        return ApiResponse.success("Module de cours cree avec succes", courseModuleService.create(courseId, request));
    }

    @GetMapping("/course/{courseId}")
    public ApiResponse<List<CourseModuleResponse>> getByCourse(@PathVariable Long courseId) {
        return ApiResponse.success("Liste des modules recuperee avec succes", courseModuleService.getByCourse(courseId));
    }

    @PutMapping("/{id}")
    public ApiResponse<CourseModuleResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody CourseModuleUpdateRequest request) {
        return ApiResponse.success("Module de cours mis a jour avec succes", courseModuleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        courseModuleService.archive(id);
        return ApiResponse.success("Module de cours archive avec succes", null);
    }
}