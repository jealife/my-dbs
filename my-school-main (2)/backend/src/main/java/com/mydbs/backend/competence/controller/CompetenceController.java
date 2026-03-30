package com.mydbs.backend.competence.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.competence.model.Badge;
import com.mydbs.backend.competence.model.BadgeAward;
import com.mydbs.backend.competence.model.Competence;
import com.mydbs.backend.competence.model.CompetenceAcquisition;
import com.mydbs.backend.competence.service.impl.CompetenceServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/competences")
@CrossOrigin(origins = "*")
@Tag(name = "Compétences & Badges", description = "Référentiel de compétences, acquisitions étudiants, badges numériques — Section 4.14")
public class CompetenceController {

    private final CompetenceServiceImpl competenceService;

    public CompetenceController(CompetenceServiceImpl competenceService) {
        this.competenceService = competenceService;
    }

    // ── RÉFÉRENTIEL ────────────────────────────────────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Créer une compétence dans le référentiel (code unique, domaine, niveau attendu BEGINNER/INTERMEDIATE/ADVANCED/EXPERT)")
    public ApiResponse<Competence> createCompetence(
            @RequestParam String code, @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) String expectedLevel,
            @RequestParam(required = false) Long programId) {
        return ApiResponse.success("Compétence créée",
                competenceService.createCompetence(code, title, description, domain, expectedLevel, programId));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Référentiel de compétences (toutes, triées domaine > titre)")
    public ApiResponse<Page<Competence>> getAllCompetences(@PageableDefault(size = 30) Pageable pageable) {
        return ApiResponse.success("Compétences récupérées", competenceService.getAllCompetences(pageable));
    }

    @GetMapping("/programs/{programId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Référentiel de compétences d'un programme")
    public ApiResponse<Page<Competence>> getByProgram(
            @PathVariable Long programId, @PageableDefault(size = 30) Pageable pageable) {
        return ApiResponse.success("Compétences programme récupérées",
                competenceService.getCompetencesByProgram(programId, pageable));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN')")
    @Operation(summary = "Archiver une compétence")
    public ApiResponse<Void> deleteCompetence(@PathVariable Long id) {
        competenceService.deleteCompetence(id);
        return ApiResponse.success("Compétence archivée", null);
    }

    // ── ACQUISITIONS ────────────────────────────────────────────────────────────

    @PostMapping("/acquisitions")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Enregistrer ou mettre à jour l'acquisition d'une compétence par un étudiant (badge auto déclenché si seuil atteint)")
    public ApiResponse<CompetenceAcquisition> acquireCompetence(
            @RequestParam Long studentId, @RequestParam Long competenceId,
            @RequestParam String acquiredLevel,
            @RequestParam(required = false) Long validatedById,
            @RequestParam(required = false) String evidenceDescription) {
        return ApiResponse.success("Acquisition enregistrée",
                competenceService.acquireCompetence(studentId, competenceId, acquiredLevel, validatedById, evidenceDescription));
    }

    @GetMapping("/students/{studentId}/portfolio")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Portfolio de compétences d'un étudiant")
    public ApiResponse<List<CompetenceAcquisition>> getStudentPortfolio(@PathVariable Long studentId) {
        return ApiResponse.success("Portfolio récupéré", competenceService.getStudentPortfolio(studentId));
    }

    // ── BADGES ─────────────────────────────────────────────────────────────────

    @PostMapping("/badges")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Créer un badge numérique (avec critères d'attribution auto ou manuelle)")
    public ApiResponse<Badge> createBadge(
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String iconUrl,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int points,
            @RequestParam(required = false) String awardCriteria,
            @RequestParam(defaultValue = "false") boolean autoAward) {
        return ApiResponse.success("Badge créé",
                competenceService.createBadge(title, description, iconUrl, category, points, awardCriteria, autoAward));
    }

    @GetMapping("/badges")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Catalogue de badges")
    public ApiResponse<Page<Badge>> getAllBadges(@PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Badges récupérés", competenceService.getAllBadges(pageable));
    }

    @PostMapping("/badges/{badgeId}/award")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Attribuer manuellement un badge à un étudiant (anti-doublon UNIQUE student+badge)")
    public ApiResponse<BadgeAward> awardBadge(
            @PathVariable Long badgeId,
            @RequestParam Long studentId,
            @RequestParam(required = false) Long awardedById,
            @RequestParam(required = false) String reason) {
        return ApiResponse.success("Badge attribué", competenceService.awardBadge(studentId, badgeId, awardedById, reason));
    }

    @GetMapping("/students/{studentId}/badges")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Badges d'un étudiant")
    public ApiResponse<List<BadgeAward>> getStudentBadges(@PathVariable Long studentId) {
        return ApiResponse.success("Badges récupérés", competenceService.getStudentBadges(studentId));
    }
}
