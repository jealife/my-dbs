package com.mydbs.backend.attendance.controller;

import com.mydbs.backend.attendance.dto.*;
import com.mydbs.backend.attendance.model.AttendanceStatus;
import com.mydbs.backend.attendance.model.JustificationStatus;
import com.mydbs.backend.attendance.service.impl.AttendanceServiceImpl;
import com.mydbs.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@CrossOrigin(origins = "*")
@Tag(name = "Attendance", description = "Gestion de la présence, feuilles d'appel, justifications et statistiques d'assiduité")
public class AttendanceController {

    private final AttendanceServiceImpl attendanceService;

    public AttendanceController(AttendanceServiceImpl attendanceService) {
        this.attendanceService = attendanceService;
    }

    // ─────────────────────── FEUILLE D'APPEL ────────────────────────────────

    @PostMapping("/sessions/{sessionId}")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','TEACHER','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Marquer la présence d'un étudiant pour une session")
    public ApiResponse<AttendanceRecordResponse> markOne(
            @PathVariable Long sessionId,
            @Valid @RequestBody AttendanceEntryRequest request) {
        return ApiResponse.success("Présence enregistrée", attendanceService.markAttendance(sessionId, request));
    }

    @PostMapping("/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','TEACHER','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Saisie en masse : feuille d'appel complète pour une session")
    public ApiResponse<List<AttendanceRecordResponse>> bulkMark(
            @Valid @RequestBody BulkAttendanceRequest request) {
        return ApiResponse.success("Feuille d'appel enregistrée", attendanceService.bulkMarkAttendance(request));
    }

    @GetMapping("/sessions/{sessionId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Obtenir la feuille d'appel d'une session")
    public ApiResponse<List<AttendanceRecordResponse>> getBySession(@PathVariable Long sessionId) {
        return ApiResponse.success("Feuille d'appel récupérée", attendanceService.getBySession(sessionId));
    }

    @GetMapping("/students/{studentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Historique de présence d'un étudiant")
    public ApiResponse<List<AttendanceRecordResponse>> getByStudent(@PathVariable Long studentId) {
        return ApiResponse.success("Historique récupéré", attendanceService.getByStudent(studentId));
    }

    @PatchMapping("/records/{recordId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','TEACHER','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Corriger le statut d'un enregistrement de présence")
    public ApiResponse<AttendanceRecordResponse> update(
            @PathVariable Long recordId,
            @RequestParam AttendanceStatus status,
            @RequestParam(required = false) String teacherNote) {
        return ApiResponse.success("Enregistrement mis à jour",
                attendanceService.updateRecord(recordId, status, teacherNote));
    }

    @DeleteMapping("/records/{recordId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Supprimer un enregistrement de présence (soft delete)")
    public ApiResponse<Void> delete(@PathVariable Long recordId) {
        attendanceService.deleteRecord(recordId);
        return ApiResponse.success("Enregistrement supprimé", null);
    }

    // ─────────────────────── STATISTIQUES ───────────────────────────────────

    @GetMapping("/stats/students/{studentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Taux d'assiduité global d'un étudiant (avec alerte si < 75%)")
    public ApiResponse<AttendanceStatsResponse> getStudentStats(@PathVariable Long studentId) {
        return ApiResponse.success("Statistiques récupérées", attendanceService.getStudentStats(studentId));
    }

    @GetMapping("/stats/students/{studentId}/courses/{courseId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Taux d'assiduité d'un étudiant pour un cours donné")
    public ApiResponse<AttendanceStatsResponse> getStudentStatsByCourse(
            @PathVariable Long studentId, @PathVariable Long courseId) {
        return ApiResponse.success("Statistiques récupérées",
                attendanceService.getStudentStatsByCourse(studentId, courseId));
    }

    // ─────────────────────── JUSTIFICATIONS ─────────────────────────────────

    @PostMapping(value = "/justifications", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','STUDENT','TEACHER','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Soumettre une justification d'absence (avec document optionnel)")
    public ApiResponse<JustificationResponse> submitJustification(
            @Valid @RequestPart("data") JustificationCreateRequest request,
            @RequestPart(value = "document", required = false) MultipartFile document) {
        return ApiResponse.success("Justification soumise",
                attendanceService.submitJustification(request, document));
    }

    @GetMapping("/justifications/pending")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER')")
    @Operation(summary = "File d'attente des justifications en attente de validation")
    public ApiResponse<Page<JustificationResponse>> getPending(
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Justifications en attente",
                attendanceService.getPendingJustifications(pageable));
    }

    @GetMapping("/justifications/students/{studentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Historique des justifications d'un étudiant")
    public ApiResponse<Page<JustificationResponse>> getStudentJustifications(
            @PathVariable Long studentId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Justifications récupérées",
                attendanceService.getStudentJustifications(studentId, pageable));
    }

    @PatchMapping("/justifications/{id}/review")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Valider ou refuser une justification (APPROVED → statut EXCUSED automatique)")
    public ApiResponse<JustificationResponse> review(
            @PathVariable Long id,
            @RequestParam JustificationStatus decision,
            @RequestParam(required = false) String comment) {
        return ApiResponse.success("Justification traitée",
                attendanceService.reviewJustification(id, decision, comment));
    }
}
