package com.mydbs.backend.ue.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.ue.dto.TeachingUnitRequest;
import com.mydbs.backend.ue.dto.TeachingUnitResponse;
import com.mydbs.backend.ue.service.TeachingUnitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CRUD pour les Unités d'Enseignement (UE) — système LMD.
 * Base path : /api/v1/teaching-units
 *
 * Droits :
 *  - Création / modification / suppression → SUPER_ADMIN, ADMIN, PEDAGOGICAL_MANAGER, TEACHER
 *  - Lecture → tous les rôles authentifiés (STUDENT inclus, pour alimenter les formulaires)
 */
@RestController
@RequestMapping("/api/v1/teaching-units")
@CrossOrigin(origins = "*")
@Tag(name = "Unités d'Enseignement (UE)", description = "Gestion des UE dans le système LMD — réservé aux enseignants et administrateurs")
public class TeachingUnitController {

    private final TeachingUnitService service;

    public TeachingUnitController(TeachingUnitService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Créer une UE (enseignants et admins uniquement)")
    public ApiResponse<TeachingUnitResponse> create(@Valid @RequestBody TeachingUnitRequest request) {
        return ApiResponse.success("UE créée avec succès", service.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Modifier une UE (enseignants et admins uniquement)")
    public ApiResponse<TeachingUnitResponse> update(@PathVariable Long id,
                                                     @Valid @RequestBody TeachingUnitRequest request) {
        return ApiResponse.success("UE mise à jour", service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Supprimer une UE (admins uniquement)")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success("UE supprimée", null);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Consulter une UE")
    public ApiResponse<TeachingUnitResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("UE récupérée", service.getById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Lister les UEs — filtrable par filière (programId) et/ou semestre")
    public ApiResponse<List<TeachingUnitResponse>> getAll(
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) String semester) {
        if (programId != null && semester != null) {
            return ApiResponse.success("UEs récupérées", service.getByProgramAndSemester(programId, semester));
        }
        if (programId != null) {
            return ApiResponse.success("UEs du programme récupérées", service.getByProgram(programId));
        }
        return ApiResponse.success("Liste des UEs", service.getAll());
    }
}
