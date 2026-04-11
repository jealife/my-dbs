package com.mydbs.backend.course.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.course.dto.SessionCreateRequest;
import com.mydbs.backend.course.dto.SessionResponse;
import com.mydbs.backend.course.dto.SessionUpdateRequest;
import com.mydbs.backend.course.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course-sessions")
@CrossOrigin(origins = "*")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping("/course/{courseId}")
    public ApiResponse<SessionResponse> create(@PathVariable Long courseId,
                                               @Valid @RequestBody SessionCreateRequest request) {
        return ApiResponse.success("Seance creee avec succes", sessionService.create(courseId, request));
    }

    @GetMapping("/course/{courseId}")
    public ApiResponse<List<SessionResponse>> getByCourse(@PathVariable Long courseId) {
        return ApiResponse.success("Liste des seances recuperee avec succes", sessionService.getByCourse(courseId));
    }

    @PutMapping("/{id}")
    public ApiResponse<SessionResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody SessionUpdateRequest request) {
        return ApiResponse.success("Seance mise a jour avec succes", sessionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        sessionService.archive(id);
        return ApiResponse.success("Seance archivee avec succes", null);
    }
}