package com.mydbs.backend.course.controller;

import com.mydbs.backend.academic.dto.ClassRoomResponse;
import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.course.dto.*;
import com.mydbs.backend.course.service.CourseProgressService;
import com.mydbs.backend.course.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    private final CourseService courseService;
    private final CourseProgressService courseProgressService;

    public CourseController(CourseService courseService,
                            CourseProgressService courseProgressService) {
        this.courseService = courseService;
        this.courseProgressService = courseProgressService;
    }

    @PostMapping
    public ApiResponse<CourseResponse> create(@Valid @RequestBody CourseCreateRequest request) {
        return ApiResponse.success("Cours cree avec succes", courseService.create(request));
    }

    /**
     * GET /api/courses               → tous les cours (admin / manager)
     * GET /api/courses?studentId=42  → cours publiés de la classe de cet utilisateur
     */
    @GetMapping
    public ApiResponse<List<CourseResponse>> getAll(
            @RequestParam(required = false) Long studentId) {
        if (studentId != null) {
            return ApiResponse.success("Cours de l'etudiant recuperes avec succes",
                    courseService.getAccessibleCoursesByUserId(studentId));
        }
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

    @GetMapping("/teacher/{teacherId}")
    public ApiResponse<List<CourseResponse>> getByTeacher(@PathVariable Long teacherId) {
        return ApiResponse.success("Cours de l'enseignant recuperes", courseService.getByInstructor(teacherId));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        courseService.archive(id);
        return ApiResponse.success("Cours archive avec succes", null);
    }

    @GetMapping("/classroom/{classRoomId}")
    public ApiResponse<List<CourseResponse>> getByClassRoom(@PathVariable Long classRoomId) {
        return ApiResponse.success("Cours de la classe recuperes avec succes", courseService.getByClassRoom(classRoomId));
    }

    @GetMapping("/program/{programId}")
    public ApiResponse<List<CourseResponse>> getByProgram(@PathVariable Long programId) {
        return ApiResponse.success("Cours du programme recuperes avec succes", courseService.getByProgram(programId));
    }

    @GetMapping("/student/{studentId}/accessible")
    public ApiResponse<List<CourseResponse>> getAccessibleCoursesForStudent(@PathVariable Long studentId) {
        return ApiResponse.success("Cours accessibles pour l'etudiant recuperes avec succes",
                courseService.getAccessibleCoursesForStudent(studentId));
    }

    /**
     * PATCH /api/courses/{id}/classroom
     * Permet à un professeur (ou responsable) d'associer une classe à son cours.
     * Body : { "classRoomId": 5 }  — envoyer null pour dissocier.
     */
    @PatchMapping("/{id}/classroom")
    public ApiResponse<CourseResponse> assignClassRoom(
            @PathVariable Long id,
            @RequestBody CourseAssignClassRoomRequest request) {
        return ApiResponse.success("Classe assignee au cours avec succes",
                courseService.assignClassRoom(id, request.classRoomId()));
    }

    /** GET /api/courses/{courseId}/classes — classes assignées au cours */
    @GetMapping("/{courseId}/classes")
    public ApiResponse<List<ClassRoomResponse>> getAssignedClasses(@PathVariable Long courseId) {
        return ApiResponse.success("Classes du cours recuperees", courseService.getAssignedClasses(courseId));
    }

    /** POST /api/courses/{courseId}/classes — assigner plusieurs classes */
    @PostMapping("/{courseId}/classes")
    public ApiResponse<CourseResponse> assignClasses(
            @PathVariable Long courseId,
            @RequestBody Map<String, List<Long>> body) {
        return ApiResponse.success("Classes assignees avec succes",
                courseService.assignClasses(courseId, body.get("classIds")));
    }

    @PostMapping("/{courseId}/enroll")
    public ApiResponse<CourseProgressResponse> enroll(
            @PathVariable Long courseId,
            @Valid @RequestBody EnrollRequest request) {
        return ApiResponse.success("Inscription effectuee avec succes",
                courseProgressService.enroll(courseId, request.userId()));
    }

    @GetMapping("/{courseId}/progress/{userId}")
    public ApiResponse<CourseProgressResponse> getProgress(
            @PathVariable Long courseId,
            @PathVariable Long userId) {
        return ApiResponse.success("Progression recuperee avec succes",
                courseProgressService.getProgress(courseId, userId));
    }

    @PostMapping("/{courseId}/lessons/{lessonId}/complete")
    public ApiResponse<CourseProgressResponse> markLessonComplete(
            @PathVariable Long courseId,
            @PathVariable Long lessonId,
            @Valid @RequestBody LessonCompleteRequest request) {
        return ApiResponse.success("Lecon marquee comme terminee",
                courseProgressService.markLessonComplete(courseId, lessonId, request.userId()));
    }
}
