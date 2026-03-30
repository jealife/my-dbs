package com.mydbs.backend.documents.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.documents.model.*;
import com.mydbs.backend.documents.service.impl.DocumentServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
@CrossOrigin(origins = "*")
@Tag(name = "GED / Documents", description = "Gestion électronique des documents : upload, versionning, recherche, journal d'audit")
public class DocumentController {

    private final DocumentServiceImpl documentService;

    public DocumentController(DocumentServiceImpl documentService) {
        this.documentService = documentService;
    }

    // ── UPLOAD ────────────────────────────────────────────────────────────

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Uploader un nouveau document (calcul SHA-256 automatique, versionning)")
    public ApiResponse<ManagedDocument> upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam Long ownerId,
            @RequestParam DocumentType documentType,
            @RequestParam(defaultValue = "MANAGER") AccessLevel accessLevel,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String referenceType,
            @RequestParam(required = false) Long referenceId,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) LocalDate expiryDate,
            @RequestParam(required = false) Long academicYearId,
            @RequestParam(required = false) String changeSummary) {
        return ApiResponse.success("Document uploadé",
                documentService.uploadDocument(file, ownerId, documentType, accessLevel,
                        title, description, referenceType, referenceId, tags, expiryDate,
                        academicYearId, changeSummary));
    }

    @PostMapping(value = "/{documentId}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Ajouter une nouvelle version à un document existant")
    public ApiResponse<DocumentVersion> addVersion(
            @PathVariable Long documentId,
            @RequestParam Long userId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String changeSummary) {
        return ApiResponse.success("Nouvelle version ajoutée",
                documentService.addVersion(documentId, userId, file, changeSummary));
    }

    // ── RECHERCHE ─────────────────────────────────────────────────────────

    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Rechercher des documents par type, propriétaire et/ou mot-clé (titre + tags)")
    public ApiResponse<Page<ManagedDocument>> search(
            @RequestParam(required = false) DocumentType type,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Documents trouvés",
                documentService.search(type, ownerId, keyword, pageable));
    }

    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Documents d'un utilisateur (propriétaire)")
    public ApiResponse<Page<ManagedDocument>> getByOwner(
            @PathVariable Long ownerId, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Documents récupérés", documentService.getByOwner(ownerId, pageable));
    }

    @GetMapping("/reference")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Documents liés à une entité (ex: referenceType=STUDENT&referenceId=42)")
    public ApiResponse<List<ManagedDocument>> getByReference(
            @RequestParam String referenceType, @RequestParam Long referenceId) {
        return ApiResponse.success("Documents récupérés",
                documentService.getByReference(referenceType, referenceId));
    }

    // ── VERSIONNING ───────────────────────────────────────────────────────

    @GetMapping("/{documentId}/versions")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Historique de toutes les versions d'un document")
    public ApiResponse<List<DocumentVersion>> getVersionHistory(
            @PathVariable Long documentId, @RequestParam Long userId) {
        return ApiResponse.success("Versions récupérées",
                documentService.getVersionHistory(documentId, userId));
    }

    @GetMapping("/{documentId}/download")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Obtenir la version courante d'un document (avec log DOWNLOAD)")
    public ApiResponse<DocumentVersion> download(
            @PathVariable Long documentId,
            @RequestParam Long userId,
            @RequestParam(required = false) String ipAddress) {
        return ApiResponse.success("Version courante",
                documentService.getCurrentVersion(documentId, userId, ipAddress));
    }

    // ── SUPPRESSION & AUDIT ───────────────────────────────────────────────

    @DeleteMapping("/{documentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Supprimer un document (soft delete + log DELETE)")
    public ApiResponse<Void> delete(
            @PathVariable Long documentId, @RequestParam Long userId) {
        documentService.deleteDocument(documentId, userId);
        return ApiResponse.success("Document supprimé", null);
    }

    @GetMapping("/{documentId}/audit")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER')")
    @Operation(summary = "Journal d'audit des accès à un document")
    public ApiResponse<Page<DocumentAccessLog>> getAuditLog(
            @PathVariable Long documentId, @PageableDefault(size = 30) Pageable pageable) {
        return ApiResponse.success("Journal d'audit", documentService.getAuditLog(documentId, pageable));
    }
}
