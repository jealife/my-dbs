package com.mydbs.backend.planning.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.planning.model.ScheduleEvent;
import com.mydbs.backend.planning.service.impl.PlanningServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/planning")
@CrossOrigin(origins = "*")
@Tag(name = "Planning & Agenda", description = "Agenda cross-modules : cours, examens, deadlines, mentorat, congés")
public class PlanningController {

    private final PlanningServiceImpl planningService;

    public PlanningController(PlanningServiceImpl planningService) {
        this.planningService = planningService;
    }

    // ── AGENDA ────────────────────────────────────────────────────────────────

    @GetMapping("/agenda")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Agenda personnel d'un utilisateur (étudiant ou enseignant) sur une plage de dates")
    public ApiResponse<List<ScheduleEvent>> getUserAgenda(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ApiResponse.success("Agenda récupéré", planningService.getUserAgenda(userId, from, to));
    }

    @GetMapping("/cohorts/{cohortId}/agenda")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Agenda complet d'une cohorte sur une plage de dates")
    public ApiResponse<List<ScheduleEvent>> getCohortAgenda(
            @PathVariable Long cohortId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ApiResponse.success("Agenda cohorte récupéré", planningService.getCohortAgenda(cohortId, from, to));
    }

    @GetMapping("/teachers/{teacherId}/slots")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Créneaux d'un enseignant (pour consultation disponibilités)")
    public ApiResponse<List<ScheduleEvent>> getTeacherSlots(@PathVariable Long teacherId) {
        return ApiResponse.success("Créneaux récupérés", planningService.getTeacherSlots(teacherId));
    }

    // ── GESTION ÉVÉNEMENTS ────────────────────────────────────────────────────

    @PostMapping("/events")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER')")
    @Operation(summary = "Créer un événement agenda (COURSE_SESSION | EXAM | DEADLINE | MENTOR_SESSION | HOLIDAY | MEETING | OTHER)")
    public ApiResponse<ScheduleEvent> createEvent(
            @RequestParam String eventType, @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startAt,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endAt,
            @RequestParam(defaultValue = "false") boolean allDay,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String meetingLink,
            @RequestParam(required = false) String recurrenceRule,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long cohortId,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) Long referenceId,
            @RequestParam(required = false) String referenceType) {
        return ApiResponse.success("Événement créé",
                planningService.createEvent(eventType, title, description, startAt, endAt, allDay,
                        location, meetingLink, recurrenceRule, userId, cohortId, teacherId, referenceId, referenceType));
    }

    @PutMapping("/events/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER')")
    @Operation(summary = "Modifier un événement agenda")
    public ApiResponse<ScheduleEvent> updateEvent(
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startAt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endAt,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String meetingLink) {
        return ApiResponse.success("Événement mis à jour",
                planningService.updateEvent(id, title, description, startAt, endAt, location, meetingLink));
    }

    @PostMapping("/events/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER')")
    @Operation(summary = "Annuler un événement avec motif (status → CANCELLED)")
    public ApiResponse<ScheduleEvent> cancelEvent(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        return ApiResponse.success("Événement annulé", planningService.cancelEvent(id, reason));
    }

    @DeleteMapping("/events/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Supprimer un événement (soft-delete)")
    public ApiResponse<Void> deleteEvent(@PathVariable Long id) {
        planningService.deleteEvent(id);
        return ApiResponse.success("Événement supprimé", null);
    }

    @GetMapping("/events/{id}/conflicts")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER')")
    @Operation(summary = "Détecter les conflits de créneaux d'un événement (overlap check)")
    public ApiResponse<List<ScheduleEvent>> detectConflicts(@PathVariable Long id) {
        return ApiResponse.success("Conflits calculés", planningService.detectConflicts(id));
    }
}
