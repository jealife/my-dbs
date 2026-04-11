package com.mydbs.backend.career.controller;

import com.mydbs.backend.career.dto.JobApplicationResponse;
import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.career.model.*;
import com.mydbs.backend.career.service.impl.CareerServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/career")
@CrossOrigin(origins = "*")
@Tag(name = "Carrière & Portfolio", description = "Offres de stage/emploi, candidatures, et portfolios étudiants")
public class CareerController {

    private final CareerServiceImpl careerService;

    public CareerController(CareerServiceImpl careerService) {
        this.careerService = careerService;
    }

    // ── OFFRES ────────────────────────────────────────────────────────────

    @PostMapping("/offers")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Publier une offre de stage/emploi (INTERNSHIP | JOB | APPRENTICESHIP)")
    public ApiResponse<JobOffer> createOffer(
            @RequestParam Long postedById, @RequestParam String title, @RequestParam String company,
            @RequestParam String description, @RequestParam String offerType,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "false") boolean remote,
            @RequestParam(required = false) LocalDate deadline,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) Integer durationMonths,
            @RequestParam(required = false) String contactEmail,
            @RequestParam(required = false) String programIds) {
        return ApiResponse.success("Offre publiée",
                careerService.createOffer(postedById, title, company, description, offerType,
                        location, remote, deadline, startDate, durationMonths, contactEmail, programIds));
    }

    @GetMapping("/offers")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Rechercher des offres actives (filtre type + mot-clé, hors offres expirées)")
    public ApiResponse<Page<JobOffer>> searchOffers(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Offres récupérées", careerService.searchOpen(type, keyword, pageable));
    }

    @PatchMapping("/offers/{offerId}/close")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Clôturer une offre")
    public ApiResponse<JobOffer> closeOffer(@PathVariable Long offerId) {
        return ApiResponse.success("Offre clôturée", careerService.closeOffer(offerId));
    }

    // ── CANDIDATURES ──────────────────────────────────────────────────────

    @PostMapping("/offers/{offerId}/apply")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('STUDENT','SUPER_ADMIN','ADMIN')")
    @Operation(summary = "Postuler à une offre (anti-doublon automatique, offre doit être OPEN)")
    public ApiResponse<JobApplication> apply(
            @PathVariable Long offerId, @RequestParam Long studentId,
            @RequestParam(required = false) String coverLetter,
            @RequestParam(required = false) String cvFilePath) {
        return ApiResponse.success("Candidature envoyée", careerService.apply(studentId, offerId, coverLetter, cvFilePath));
    }

    @PatchMapping("/applications/{appId}/status")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Mettre à jour le statut d'une candidature (UNDER_REVIEW | INTERVIEW | ACCEPTED | REJECTED | WITHDRAWN)")
    public ApiResponse<JobApplication> updateStatus(
            @PathVariable Long appId, @RequestParam String status,
            @RequestParam(required = false) String recruiterNotes) {
        return ApiResponse.success("Statut mis à jour", careerService.updateApplicationStatus(appId, status, recruiterNotes));
    }

    @GetMapping("/students/{studentId}/applications")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','STUDENT')")
    @Operation(summary = "Candidatures d'un étudiant")
    public ApiResponse<Page<JobApplication>> getStudentApplications(
            @PathVariable Long studentId, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Candidatures récupérées", careerService.getStudentApplications(studentId, pageable));
    }

    @GetMapping("/offers/{offerId}/applications")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Candidatures reçues pour une offre (enrichies avec infos étudiant)")
    public ApiResponse<Page<JobApplicationResponse>> getOfferApplications(
            @PathVariable Long offerId, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Candidatures récupérées", careerService.getOfferApplications(offerId, pageable));
    }

    // ── PORTFOLIO ─────────────────────────────────────────────────────────

    @PostMapping("/portfolio")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','STUDENT')")
    @Operation(summary = "Ajouter un projet au portfolio étudiant")
    public ApiResponse<PortfolioProject> addProject(
            @RequestParam Long studentId, @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String projectUrl,
            @RequestParam(required = false) String repositoryUrl,
            @RequestParam(required = false) String technologies,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(defaultValue = "false") boolean publiclyVisible,
            @RequestParam(required = false) Long courseId) {
        return ApiResponse.success("Projet ajouté",
                careerService.addProject(studentId, title, description, projectUrl, repositoryUrl,
                        technologies, startDate, endDate, publiclyVisible, courseId));
    }

    @GetMapping("/portfolio/students/{studentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Portfolio d'un étudiant")
    public ApiResponse<List<PortfolioProject>> getPortfolio(@PathVariable Long studentId) {
        return ApiResponse.success("Portfolio récupéré", careerService.getStudentPortfolio(studentId));
    }

    @GetMapping("/portfolio/showcase")
    @Operation(summary = "Vitrine publique des projets étudiants (accès public)")
    public ApiResponse<Page<PortfolioProject>> getShowcase(@PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Vitrine récupérée", careerService.getPublicShowcase(pageable));
    }
}
