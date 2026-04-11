package com.mydbs.backend.mentoring.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.mentoring.model.*;
import com.mydbs.backend.mentoring.service.impl.MentoringServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/mentoring")
@CrossOrigin(origins = "*")
@Tag(name = "Mentorat", description = "Gestion des relations mentor-mentoré, séances et plans d'action")
public class MentoringController {

    private final MentoringServiceImpl mentoringService;

    public MentoringController(MentoringServiceImpl mentoringService) {
        this.mentoringService = mentoringService;
    }

    // ── MENTORSHIPS ───────────────────────────────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Créer une relation de mentorat")
    public ApiResponse<Mentorship> create(
            @RequestParam Long mentorId, @RequestParam Long menteeId,
            @RequestParam(required = false) String goals,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) Long academicYearId) {
        return ApiResponse.success("Mentorat créé",
                mentoringService.createMentorship(mentorId, menteeId, goals, startDate, endDate, academicYearId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Mettre à jour le statut du mentorat (ACTIVE | COMPLETED | CANCELLED)")
    public ApiResponse<Mentorship> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ApiResponse.success("Statut mis à jour", mentoringService.updateStatus(id, status));
    }

    @GetMapping("/mentees/{menteeId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Mentorats d'un étudiant (mentoré)")
    public ApiResponse<Page<Mentorship>> getMenteeMentorships(
            @PathVariable Long menteeId, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Mentorats récupérés", mentoringService.getMenteeMentorships(menteeId, pageable));
    }

    @GetMapping("/mentors/{mentorId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Mentorats conduits par un mentor")
    public ApiResponse<Page<Mentorship>> getMentorMentorships(
            @PathVariable Long mentorId, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Mentorats récupérés", mentoringService.getMentorMentorships(mentorId, pageable));
    }

    // ── SESSIONS ──────────────────────────────────────────────────────────

    @PostMapping("/{mentorshipId}/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Planifier une séance de mentorat")
    public ApiResponse<MentoringSession> addSession(
            @PathVariable Long mentorshipId,
            @RequestParam LocalDate date,
            @RequestParam(required = false) LocalTime startTime,
            @RequestParam(required = false) LocalTime endTime,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String notes) {
        return ApiResponse.success("Séance planifiée",
                mentoringService.addSession(mentorshipId, date, startTime, endTime, location, notes));
    }

    @PatchMapping("/sessions/{sessionId}/status")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Mettre à jour le statut d'une séance (PLANNED | DONE | CANCELLED)")
    public ApiResponse<MentoringSession> updateSessionStatus(
            @PathVariable Long sessionId, @RequestParam String status,
            @RequestParam(required = false) String notes) {
        return ApiResponse.success("Séance mise à jour", mentoringService.updateSessionStatus(sessionId, status, notes));
    }

    @GetMapping("/{mentorshipId}/sessions")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Historique des séances d'un mentorat")
    public ApiResponse<List<MentoringSession>> getSessions(@PathVariable Long mentorshipId) {
        return ApiResponse.success("Séances récupérées", mentoringService.getSessions(mentorshipId));
    }

    // ── ACTION PLANS ──────────────────────────────────────────────────────

    @PostMapping("/{mentorshipId}/action-plans")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Ajouter un plan d'action à un mentorat")
    public ApiResponse<ActionPlan> addActionPlan(
            @PathVariable Long mentorshipId, @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) LocalDate dueDate) {
        return ApiResponse.success("Plan d'action créé",
                mentoringService.addActionPlan(mentorshipId, title, description, dueDate));
    }

    @PatchMapping("/action-plans/{planId}/complete")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Marquer un plan d'action comme complété")
    public ApiResponse<ActionPlan> completeActionPlan(@PathVariable Long planId) {
        return ApiResponse.success("Plan d'action complété", mentoringService.completeActionPlan(planId));
    }

    @GetMapping("/{mentorshipId}/action-plans")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Plans d'action d'un mentorat")
    public ApiResponse<List<ActionPlan>> getActionPlans(@PathVariable Long mentorshipId) {
        return ApiResponse.success("Plans d'action récupérés", mentoringService.getActionPlans(mentorshipId));
    }
}
