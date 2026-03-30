package com.mydbs.backend.evaluation.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.evaluation.dto.*;
import com.mydbs.backend.evaluation.model.EvaluationStatus;
import com.mydbs.backend.evaluation.service.EvaluationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/evaluations")
@CrossOrigin(origins = "*")
@Tag(name = "Evaluations", description = "Gestion des évaluations, notes, rubriques et délibérations")
public class EvaluationController {

    private final EvaluationService evaluationService;

    public EvaluationController(EvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    // ─────────────────────── EVALUATIONS ────────────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Créer une évaluation")
    public ApiResponse<EvaluationResponse> create(@Valid @RequestBody EvaluationCreateRequest request) {
        return ApiResponse.success("Évaluation créée", evaluationService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Lister les évaluations", description = "Filtres optionnels : status, courseId, cohortId")
    public ApiResponse<Page<EvaluationSummaryResponse>> getAll(
            @RequestParam(required = false) EvaluationStatus status,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long cohortId,
            @PageableDefault(size = 20, sort = "scheduledAt") Pageable pageable) {
        return ApiResponse.success("Liste des évaluations", evaluationService.getAll(status, courseId, cohortId, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Détail d'une évaluation")
    public ApiResponse<EvaluationResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Évaluation récupérée", evaluationService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Modifier une évaluation (DRAFT ou SCHEDULED uniquement)")
    public ApiResponse<EvaluationResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody EvaluationCreateRequest request) {
        return ApiResponse.success("Évaluation mise à jour", evaluationService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Changer le statut d'une évaluation",
            description = "Workflow: DRAFT→SCHEDULED→IN_PROGRESS→CLOSED→RESULTS_PUBLISHED")
    public ApiResponse<EvaluationResponse> changeStatus(
            @PathVariable Long id,
            @RequestParam EvaluationStatus targetStatus) {
        return ApiResponse.success("Statut mis à jour", evaluationService.changeStatus(id, targetStatus));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN')")
    @Operation(summary = "Archiver une évaluation (soft delete)")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        evaluationService.archive(id);
        return ApiResponse.success("Évaluation archivée", null);
    }

    // ─────────────────────── GRADE ENTRY ────────────────────────────────────

    @PostMapping("/{id}/grades")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Saisir une note pour un étudiant")
    public ApiResponse<EvaluationResultResponse> enterGrade(
            @PathVariable Long id,
            @Valid @RequestBody GradeEntryRequest request) {
        return ApiResponse.success("Note saisie", evaluationService.enterGrade(id, request));
    }

    @GetMapping("/{id}/grades")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER')")
    @Operation(summary = "Obtenir toutes les notes d'une évaluation")
    public ApiResponse<List<EvaluationResultResponse>> getGrades(@PathVariable Long id) {
        return ApiResponse.success("Notes récupérées", evaluationService.getResultsByEvaluation(id));
    }

    @GetMapping("/{id}/grades/student/{studentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Obtenir la note d'un étudiant pour une évaluation")
    public ApiResponse<EvaluationResultResponse> getStudentGrade(
            @PathVariable Long id,
            @PathVariable Long studentId) {
        return ApiResponse.success("Note récupérée", evaluationService.getResultByStudent(id, studentId));
    }

    @PatchMapping("/grades/{resultId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Corriger une note (non publiée uniquement)")
    public ApiResponse<EvaluationResultResponse> updateGrade(
            @PathVariable Long resultId,
            @RequestBody GradeEntryRequest request) {
        return ApiResponse.success("Note mise à jour", evaluationService.updateGrade(resultId, request));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Publier les résultats d'une évaluation (rend les notes visibles aux étudiants)")
    public ApiResponse<EvaluationResponse> publishResults(@PathVariable Long id) {
        return ApiResponse.success("Résultats publiés", evaluationService.publishResults(id));
    }

    // ─────────────────────── VUE ÉTUDIANT ───────────────────────────────────

    @GetMapping("/my-results/student/{studentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','STUDENT')")
    @Operation(summary = "Mes résultats publiés (vue étudiant)")
    public ApiResponse<List<EvaluationResultResponse>> getMyResults(@PathVariable Long studentId) {
        return ApiResponse.success("Résultats récupérés", evaluationService.getMyResults(studentId));
    }

    @GetMapping("/my-results/student/{studentId}/course/{courseId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Résultats publiés d'un étudiant pour un cours donné")
    public ApiResponse<List<EvaluationResultResponse>> getStudentResultsByCourse(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {
        return ApiResponse.success("Résultats récupérés", evaluationService.getStudentResultsByCourse(studentId, courseId));
    }

    // ─────────────────────── RUBRIC ─────────────────────────────────────────

    @PostMapping("/{id}/rubric")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Ajouter un critère à la grille d'évaluation (rubric)")
    public ApiResponse<RubricResponse> addCriterion(
            @PathVariable Long id,
            @Valid @RequestBody RubricCreateRequest request) {
        return ApiResponse.success("Critère ajouté", evaluationService.addRubricCriterion(id, request));
    }

    @GetMapping("/{id}/rubric")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Obtenir la grille d'évaluation")
    public ApiResponse<List<RubricResponse>> getRubric(@PathVariable Long id) {
        return ApiResponse.success("Grille récupérée", evaluationService.getRubric(id));
    }

    @DeleteMapping("/rubric/{criterionId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Supprimer un critère de la grille")
    public ApiResponse<Void> deleteCriterion(@PathVariable Long criterionId) {
        evaluationService.deleteRubricCriterion(criterionId);
        return ApiResponse.success("Critère supprimé", null);
    }

    // ─────────────────────── DÉLIBÉRATION ───────────────────────────────────

    @PostMapping("/deliberations")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Créer une session de jury/délibération")
    public ApiResponse<DeliberationResponse> createDeliberation(
            @Valid @RequestBody DeliberationCreateRequest request) {
        return ApiResponse.success("Délibération créée", evaluationService.createDeliberation(request));
    }

    @GetMapping("/deliberations")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER')")
    @Operation(summary = "Lister les délibérations (filtrer par cohortId ou academicYearId)")
    public ApiResponse<Page<DeliberationResponse>> getDeliberations(
            @RequestParam(required = false) Long cohortId,
            @RequestParam(required = false) Long academicYearId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Délibérations récupérées",
                evaluationService.getDeliberations(cohortId, academicYearId, pageable));
    }

    @GetMapping("/deliberations/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER')")
    @Operation(summary = "Détail d'une délibération")
    public ApiResponse<DeliberationResponse> getDeliberation(@PathVariable Long id) {
        return ApiResponse.success("Délibération récupérée", evaluationService.getDeliberationById(id));
    }

    @PostMapping("/deliberations/{id}/publish")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Clôturer et publier une délibération (valide les résultats du jury)")
    public ApiResponse<DeliberationResponse> publishDeliberation(@PathVariable Long id) {
        return ApiResponse.success("Délibération publiée", evaluationService.publishDeliberation(id));
    }

    @DeleteMapping("/deliberations/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN')")
    @Operation(summary = "Archiver une délibération")
    public ApiResponse<Void> archiveDeliberation(@PathVariable Long id) {
        evaluationService.archiveDeliberation(id);
        return ApiResponse.success("Délibération archivée", null);
    }
}
