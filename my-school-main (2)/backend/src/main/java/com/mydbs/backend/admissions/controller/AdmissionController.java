package com.mydbs.backend.admissions.controller;

import com.mydbs.backend.admissions.dto.*;
import com.mydbs.backend.admissions.model.ApplicationStatus;
import com.mydbs.backend.admissions.service.AdmissionService;
import com.mydbs.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
@RequestMapping("/api/v1/admissions")
@CrossOrigin(origins = "*")
@Tag(name = "Admissions", description = "Gestion des candidatures et dossiers d'admission")
public class AdmissionController {

    private final AdmissionService admissionService;

    public AdmissionController(AdmissionService admissionService) {
        this.admissionService = admissionService;
    }

    // ─────────────────────── CRUD APPLICATION ───────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','CANDIDATE')")
    @Operation(summary = "Créer une candidature", description = "Crée un nouveau dossier en statut DRAFT")
    public ApiResponse<AdmissionApplicationResponse> create(
            @Valid @RequestBody AdmissionApplicationCreateRequest request) {
        return ApiResponse.success("Candidature créée avec succès", admissionService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Lister les candidatures", description = "Liste paginée avec filtre optionnel par statut")
    public ApiResponse<Page<AdmissionApplicationSummaryResponse>> getAll(
            @RequestParam(required = false) ApplicationStatus status,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ApiResponse.success("Liste des candidatures récupérée", admissionService.getAll(status, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','CANDIDATE')")
    @Operation(summary = "Détail d'une candidature")
    public ApiResponse<AdmissionApplicationResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Candidature récupérée", admissionService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','CANDIDATE')")
    @Operation(summary = "Modifier une candidature", description = "Modification possible uniquement en statut DRAFT")
    public ApiResponse<AdmissionApplicationResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AdmissionApplicationUpdateRequest request) {
        return ApiResponse.success("Candidature mise à jour", admissionService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Changer le statut d'une candidature",
            description = "Workflow: DRAFT→PENDING_REVIEW→UNDER_REVIEW→VALIDATED→ENROLLED (ou REJECTED)")
    public ApiResponse<AdmissionApplicationResponse> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdmissionStatusChangeRequest request) {
        return ApiResponse.success("Statut mis à jour", admissionService.changeStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN')")
    @Operation(summary = "Archiver une candidature (soft delete)")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        admissionService.archive(id);
        return ApiResponse.success("Candidature archivée", null);
    }

    // ─────────────────────── DOCUMENTS ──────────────────────────────────────

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','CANDIDATE')")
    @Operation(summary = "Uploader une pièce justificative")
    public ApiResponse<SupportingDocumentResponse> uploadDocument(
            @PathVariable Long id,
            @RequestParam String documentType,
            @RequestParam MultipartFile file) {
        return ApiResponse.success("Document uploadé avec succès",
                admissionService.uploadDocument(id, documentType, file));
    }

    @GetMapping("/{id}/documents")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','CANDIDATE')")
    @Operation(summary = "Lister les pièces justificatives d'une candidature")
    public ApiResponse<List<SupportingDocumentResponse>> getDocuments(@PathVariable Long id) {
        return ApiResponse.success("Documents récupérés", admissionService.getDocuments(id));
    }

    @DeleteMapping("/documents/{docId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER')")
    @Operation(summary = "Supprimer une pièce justificative (soft delete)")
    public ApiResponse<Void> deleteDocument(@PathVariable Long docId) {
        admissionService.deleteDocument(docId);
        return ApiResponse.success("Document supprimé", null);
    }

    @PatchMapping("/documents/{docId}/verify")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER')")
    @Operation(summary = "Vérifier ou invalider une pièce justificative")
    public ApiResponse<SupportingDocumentResponse> verifyDocument(
            @PathVariable Long docId,
            @RequestBody DocumentVerificationRequest request) {
        return ApiResponse.success("Document vérifié", admissionService.verifyDocument(docId, request));
    }

    // ─────────────────────── NOTES ──────────────────────────────────────────

    @PostMapping("/{id}/notes")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Ajouter une note interne ou publique à un dossier")
    public ApiResponse<AdmissionNoteResponse> addNote(
            @PathVariable Long id,
            @Valid @RequestBody AdmissionNoteCreateRequest request) {
        return ApiResponse.success("Note ajoutée", admissionService.addNote(id, request));
    }

    @GetMapping("/{id}/notes")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','CANDIDATE')")
    @Operation(summary = "Récupérer les notes d'un dossier",
            description = "includeInternal=true requis pour voir les notes internes (réservé au staff)")
    public ApiResponse<List<AdmissionNoteResponse>> getNotes(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean includeInternal) {
        return ApiResponse.success("Notes récupérées", admissionService.getNotes(id, includeInternal));
    }
}
