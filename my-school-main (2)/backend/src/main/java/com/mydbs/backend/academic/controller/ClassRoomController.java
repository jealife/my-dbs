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

    @GetMapping("/program/{programId}")
    public ApiResponse<List<ClassRoomResponse>> getByProgram(@PathVariable Long programId) {
        return ApiResponse.success("Classes du programme recuperees avec succes", classRoomService.getByProgram(programId));
    }

    @GetMapping("/academic-year/{academicYearId}")
    public ApiResponse<List<ClassRoomResponse>> getByAcademicYear(@PathVariable Long academicYearId) {
        return ApiResponse.success("Classes de l'annee academique recuperees avec succes", classRoomService.getByAcademicYear(academicYearId));
    }

    @GetMapping("/{id}/student-count")
    public ApiResponse<Long> getStudentCount(@PathVariable Long id) {
        return ApiResponse.success("Nombre d'etudiants recupere avec succes", classRoomService.getStudentCount(id));
    }

    @GetMapping("/{id}/is-full")
    public ApiResponse<Boolean> isClassFull(@PathVariable Long id) {
        return ApiResponse.success("Statut de capacite recupere avec succes", classRoomService.isClassFull(id));
    }

    @GetMapping("/{id}/can-enroll")
    public ApiResponse<Boolean> canEnrollStudent(@PathVariable Long id) {
        return ApiResponse.success("Possibilite d'inscription recuperee avec succes", classRoomService.canEnrollStudent(id));
    }

    /**
     * PATCH /api/classes/{id}/capacity?value=30
     * Réservé à l'administrateur — modifie uniquement la capacité de la classe.
     * Refuse si la nouvelle valeur est inférieure au nombre d'élèves déjà inscrits.
     */
    @PatchMapping("/{id}/capacity")
    public ApiResponse<ClassRoomResponse> updateCapacity(
            @PathVariable Long id,
            @RequestParam("value") int capacity) {
        return ApiResponse.success("Capacite mise a jour avec succes", classRoomService.updateCapacity(id, capacity));
    }

    /**
     * PATCH /api/classes/global-capacity?value=40&applyToAll=true
     * Définit le quota par défaut et peut l'appliquer à toutes les classes existantes.
     */
    @PatchMapping("/global-capacity")
    public ApiResponse<Void> updateGlobalCapacity(
            @RequestParam("value") int capacity,
            @RequestParam(value = "applyToAll", defaultValue = "false") boolean applyToAll) {
        classRoomService.setDefaultCapacity(capacity);
        if (applyToAll) {
            classRoomService.updateAllCapacities(capacity);
        }
        return ApiResponse.success("Quota global mis a jour avec succes", null);
    }

    @GetMapping("/default-capacity")
    public ApiResponse<Integer> getDefaultCapacity() {
        return ApiResponse.success("Quota par defaut recupere", classRoomService.getDefaultCapacity());
    }
}
