package com.mydbs.backend.pdf;

import com.mydbs.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pdf")
@CrossOrigin(origins = "*")
@Tag(name = "Export PDF", description = "Génération de bulletins, relevés de notes et confirmations d'inscription en PDF")
public class PdfController {

    private final PdfService pdfService;

    public PdfController(PdfService pdfService) {
        this.pdfService = pdfService;
    }

    @GetMapping("/bulletins/{bulletinId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Télécharger le bulletin de notes en PDF (Content-Type: application/pdf)")
    public ResponseEntity<byte[]> downloadBulletinPdf(@PathVariable Long bulletinId) {
        byte[] pdf = pdfService.generateBulletinPdf(bulletinId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bulletin_" + bulletinId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }

    @GetMapping("/transcripts/{studentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Télécharger le relevé de notes officiel d'un étudiant en PDF (toutes années si academicYearId omis)")
    public ResponseEntity<byte[]> downloadTranscriptPdf(
            @PathVariable Long studentId,
            @RequestParam(required = false) Long academicYearId) {
        byte[] pdf = pdfService.generateTranscriptPdf(studentId, academicYearId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"releve_" + studentId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }

    @GetMapping("/status")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN')")
    @Operation(summary = "Statut du service PDF (test de disponibilité)")
    public ApiResponse<String> pdfStatus() {
        return ApiResponse.success("Service PDF opérationnel", "iText 7.2.5 — OK");
    }
}
