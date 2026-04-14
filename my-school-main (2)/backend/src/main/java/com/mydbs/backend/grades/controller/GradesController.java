package com.mydbs.backend.grades.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.grades.dto.*;
import com.mydbs.backend.grades.service.impl.GradesServiceImpl;
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
@RequestMapping("/api/v1/grades")
@CrossOrigin(origins = "*")
@Tag(name = "Grades & Bulletins", description = "Carnets de notes, moyennes pondérées, bulletins, crédits ECTS et relevés de notes")
public class GradesController {

    private final GradesServiceImpl gradesService;

    public GradesController(GradesServiceImpl gradesService) {
        this.gradesService = gradesService;
    }

    // ─────────────────────── GRADE BOOKS ─────────────────────────────────

    @GetMapping("/grade-books")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Obtenir ou créer le carnet de notes d'un étudiant pour un cours")
    public ApiResponse<GradeBookResponse> getOrCreateGradeBook(
            @RequestParam Long studentId,
            @RequestParam Long courseId,
            @RequestParam Long academicYearId,
            @RequestParam(required = false) Long cohortId,
            @RequestParam(required = false) String semester) {
        return ApiResponse.success("Carnet de notes récupéré",
                gradesService.getOrCreateGradeBook(studentId, courseId, academicYearId, cohortId, semester));
    }

    @GetMapping("/grade-books/students/{studentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Tous les carnets de notes d'un étudiant (toutes années si academicYearId omis)")
    public ApiResponse<List<GradeBookResponse>> getStudentGradeBooks(
            @PathVariable Long studentId,
            @RequestParam(required = false) Long academicYearId) {
        return ApiResponse.success("Carnets de notes récupérés",
                gradesService.getStudentGradeBooks(studentId, academicYearId));
    }

    @PatchMapping("/grade-books/{gradeBookId}/appreciation")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Ajouter/modifier l'appréciation enseignant d'un carnet")
    public ApiResponse<GradeBookResponse> updateAppreciation(
            @PathVariable Long gradeBookId,
            @RequestParam String appreciation) {
        return ApiResponse.success("Appréciation mise à jour",
                gradesService.updateTeacherAppreciation(gradeBookId, appreciation));
    }

    // ─────────────────────── GRADE ITEMS ─────────────────────────────────

    @PostMapping("/grade-items")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Ajouter une note dans un carnet (moyenne recalculée automatiquement)")
    public ApiResponse<GradeItemResponse> addGradeItem(@Valid @RequestBody GradeItemCreateRequest request) {
        return ApiResponse.success("Note ajoutée, moyenne recalculée",
                gradesService.addGradeItem(request));
    }

    @DeleteMapping("/grade-items/{itemId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Supprimer une note (moyenne recalculée automatiquement)")
    public ApiResponse<Void> deleteGradeItem(@PathVariable Long itemId) {
        gradesService.deleteGradeItem(itemId);
        return ApiResponse.success("Note supprimée, moyenne recalculée", null);
    }

    // ─────────────────────── BULLETINS ───────────────────────────────────

    @PostMapping("/bulletins/generate")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Générer le bulletin d'un étudiant pour un semestre (calcul automatique moyenne + rang cohorte + ECTS)")
    public ApiResponse<BulletinResponse> generateBulletin(
            @RequestParam Long studentId,
            @RequestParam Long academicYearId,
            @RequestParam(required = false) Long cohortId,
            @RequestParam String semester) {
        return ApiResponse.success("Bulletin généré",
                gradesService.generateBulletin(studentId, academicYearId, cohortId, semester));
    }

    @GetMapping("/bulletins/students/{studentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Consulter un bulletin étudiant (visibilité étudiante : uniquement PUBLISHED)")
    public ApiResponse<BulletinResponse> getStudentBulletin(
            @PathVariable Long studentId,
            @RequestParam Long academicYearId,
            @RequestParam String semester) {
        return ApiResponse.success("Bulletin récupéré",
                gradesService.getStudentBulletin(studentId, academicYearId, semester));
    }

    @PatchMapping("/bulletins/{bulletinId}/publish")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Publier un bulletin (visible par l'étudiant)")
    public ApiResponse<BulletinResponse> publishBulletin(
            @PathVariable Long bulletinId,
            @RequestParam(required = false) String comment) {
        return ApiResponse.success("Bulletin publié", gradesService.publishBulletin(bulletinId, comment));
    }

    @GetMapping("/bulletins/cohorts/{cohortId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER')")
    @Operation(summary = "Tous les bulletins d'une cohorte pour un semestre (avec classement)")
    public ApiResponse<Page<BulletinResponse>> getCohortBulletins(
            @PathVariable Long cohortId,
            @RequestParam Long academicYearId,
            @RequestParam String semester,
            @PageableDefault(size = 30, sort = "rankInCohort") Pageable pageable) {
        return ApiResponse.success("Bulletins récupérés",
                gradesService.getCohortBulletins(cohortId, academicYearId, semester, pageable));
    }

    // ─────────────────────── CRÉDITS ECTS ────────────────────────────────

    @PostMapping("/credits")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Enregistrer l'acquisition de crédits ECTS pour un cours validé")
    public ApiResponse<Void> recordCredits(
            @RequestParam Long studentId,
            @RequestParam Long courseId,
            @RequestParam Long academicYearId,
            @RequestParam int credits,
            @RequestParam double grade,
            @RequestParam(required = false) String semester) {
        gradesService.recordCreditAcquisition(studentId, courseId, academicYearId, credits, grade, semester);
        return ApiResponse.success("Crédits ECTS enregistrés", null);
    }
}
