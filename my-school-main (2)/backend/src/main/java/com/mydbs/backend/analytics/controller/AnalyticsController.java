package com.mydbs.backend.analytics.controller;

import com.mydbs.backend.analytics.model.AnalyticsSnapshot;
import com.mydbs.backend.analytics.model.RiskAlert;
import com.mydbs.backend.analytics.service.impl.AnalyticsServiceImpl;
import com.mydbs.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/analytics")
@CrossOrigin(origins = "*")
@Tag(name = "Analytics & IA", description = "Indicateurs académiques, score de risque de décrochage, alertes automatiques")
public class AnalyticsController {

    private final AnalyticsServiceImpl analyticsService;

    public AnalyticsController(AnalyticsServiceImpl analyticsService) {
        this.analyticsService = analyticsService;
    }

    // ── SNAPSHOTS ──────────────────────────────────────────────────────────

    @PostMapping("/snapshots")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER')")
    @Operation(summary = "Calculer ou mettre à jour le snapshot analytique d'un étudiant "
            + "(dropout risk score pondéré : 40% assiduité + 40% notes + 20% devoirs ; alertes auto)")
    public ApiResponse<AnalyticsSnapshot> computeSnapshot(
            @RequestParam Long studentId,
            @RequestParam Long academicYearId,
            @RequestParam(required = false) Long cohortId,
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) BigDecimal attendanceRate,
            @RequestParam(required = false) BigDecimal averageGrade,
            @RequestParam(required = false) BigDecimal assignmentCompletionRate,
            @RequestParam(required = false) Integer ectsEarned,
            @RequestParam(required = false) Integer lateSubmissions,
            @RequestParam(required = false) Integer unjustifiedAbsences,
            @RequestParam(required = false) Integer cohortRank) {
        return ApiResponse.success("Snapshot calculé",
                analyticsService.computeStudentSnapshot(studentId, academicYearId, cohortId, programId,
                        attendanceRate, averageGrade, assignmentCompletionRate,
                        ectsEarned, lateSubmissions, unjustifiedAbsences, cohortRank));
    }

    @GetMapping("/snapshots/students/{studentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Historique des snapshots analytiques d'un étudiant")
    public ApiResponse<Page<AnalyticsSnapshot>> getStudentSnapshots(
            @PathVariable Long studentId, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Snapshots récupérés", analyticsService.getStudentSnapshots(studentId, pageable));
    }

    @GetMapping("/snapshots/cohorts/{cohortId}/risk-ranking")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER')")
    @Operation(summary = "Classement des étudiants d'une cohorte par score de risque de décrochage (plus haut = plus à risque)")
    public ApiResponse<Page<AnalyticsSnapshot>> getCohortRiskRanking(
            @PathVariable Long cohortId, @PageableDefault(size = 30) Pageable pageable) {
        return ApiResponse.success("Classement de risque récupéré",
                analyticsService.getCohortRiskRanking(cohortId, pageable));
    }

    // ── ALERTES ────────────────────────────────────────────────────────────

    @GetMapping("/alerts")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER')")
    @Operation(summary = "Toutes les alertes par statut (OPEN | ACKNOWLEDGED | RESOLVED)")
    public ApiResponse<Page<RiskAlert>> getAlertsByStatus(
            @RequestParam(defaultValue = "OPEN") String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Alertes récupérées", analyticsService.getAlertsByStatus(status, pageable));
    }

    @GetMapping("/alerts/students/{studentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER')")
    @Operation(summary = "Alertes d'un étudiant")
    public ApiResponse<Page<RiskAlert>> getStudentAlerts(
            @PathVariable Long studentId, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Alertes étudiant récupérées", analyticsService.getStudentAlerts(studentId, pageable));
    }

    @GetMapping("/alerts/managers/{managerId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Alertes ouvertes assignées à un responsable pédagogique")
    public ApiResponse<Page<RiskAlert>> getManagerAlerts(
            @PathVariable Long managerId, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Alertes manager récupérées", analyticsService.getManagerAlerts(managerId, pageable));
    }

    @GetMapping("/alerts/count-open")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER')")
    @Operation(summary = "Nombre d'alertes ouvertes (badge tableau de bord)")
    public ApiResponse<Long> countOpenAlerts() {
        return ApiResponse.success("Alertes ouvertes", analyticsService.countOpenAlerts());
    }

    @PatchMapping("/alerts/{alertId}/acknowledge")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Prendre en charge une alerte (OPEN → ACKNOWLEDGED)")
    public ApiResponse<RiskAlert> acknowledgeAlert(
            @PathVariable Long alertId, @RequestParam Long assignedToId) {
        return ApiResponse.success("Alerte prise en charge", analyticsService.acknowledgeAlert(alertId, assignedToId));
    }

    @PatchMapping("/alerts/{alertId}/resolve")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Résoudre une alerte (ACKNOWLEDGED → RESOLVED)")
    public ApiResponse<RiskAlert> resolveAlert(@PathVariable Long alertId) {
        return ApiResponse.success("Alerte résolue", analyticsService.resolveAlert(alertId));
    }
}
