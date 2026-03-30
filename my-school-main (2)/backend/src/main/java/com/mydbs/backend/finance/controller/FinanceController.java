package com.mydbs.backend.finance.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.finance.model.*;
import com.mydbs.backend.finance.service.impl.FinanceServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/finance")
@CrossOrigin(origins = "*")
@Tag(name = "Finance", description = "Gestion des frais de scolarité, factures, paiements, échéanciers et bourses")
public class FinanceController {

    private final FinanceServiceImpl financeService;

    public FinanceController(FinanceServiceImpl financeService) {
        this.financeService = financeService;
    }

    // ── FACTURES ──────────────────────────────────────────────────────────

    @PostMapping("/invoices")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER')")
    @Operation(summary = "Créer une facture pour un étudiant (numéro INV-YYYY-XXXXX généré automatiquement)")
    public ApiResponse<Invoice> createInvoice(
            @RequestParam Long studentId,
            @RequestParam Long academicYearId,
            @RequestParam String label,
            @RequestParam BigDecimal totalAmount,
            @RequestParam(defaultValue = "XOF") String currency,
            @RequestParam(required = false) LocalDate dueDate,
            @RequestParam(required = false) String notes) {
        return ApiResponse.success("Facture créée",
                financeService.createInvoice(studentId, academicYearId, label, totalAmount, currency, dueDate, notes));
    }

    @GetMapping("/invoices/students/{studentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','STUDENT')")
    @Operation(summary = "Historique des factures d'un étudiant")
    public ApiResponse<Page<Invoice>> getStudentInvoices(
            @PathVariable Long studentId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success("Factures récupérées",
                financeService.getStudentInvoices(studentId, pageable));
    }

    @GetMapping("/invoices/outstanding/{studentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','STUDENT')")
    @Operation(summary = "Solde impayé total d'un étudiant")
    public ApiResponse<BigDecimal> getOutstandingBalance(@PathVariable Long studentId) {
        return ApiResponse.success("Solde récupéré", financeService.getOutstandingBalance(studentId));
    }

    @GetMapping("/invoices/by-status")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER')")
    @Operation(summary = "Factures par statut (OVERDUE pour relances, PENDING pour suivi)")
    public ApiResponse<Page<Invoice>> getByStatus(
            @RequestParam InvoiceStatus status,
            @PageableDefault(size = 30) Pageable pageable) {
        return ApiResponse.success("Factures récupérées", financeService.getByStatus(status, pageable));
    }

    @PostMapping("/invoices/{invoiceId}/apply-scholarship/{scholarshipId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER')")
    @Operation(summary = "Appliquer une bourse approuvée à une facture (réduction auto)")
    public ApiResponse<Invoice> applyScholarship(
            @PathVariable Long invoiceId, @PathVariable Long scholarshipId) {
        return ApiResponse.success("Bourse appliquée", financeService.applyScholarship(invoiceId, scholarshipId));
    }

    // ── PAIEMENTS ─────────────────────────────────────────────────────────

    @PostMapping("/invoices/{invoiceId}/payments")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER')")
    @Operation(summary = "Enregistrer un paiement (solde facture mis à jour automatiquement)")
    public ApiResponse<Payment> recordPayment(
            @PathVariable Long invoiceId,
            @RequestParam BigDecimal amount,
            @RequestParam PaymentMethod method,
            @RequestParam(required = false) LocalDate paymentDate,
            @RequestParam(required = false) String transactionId,
            @RequestParam(required = false) String notes) {
        return ApiResponse.success("Paiement enregistré",
                financeService.recordPayment(invoiceId, amount, method, paymentDate, transactionId, notes));
    }

    @GetMapping("/invoices/{invoiceId}/payments")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','STUDENT')")
    @Operation(summary = "Historique des paiements d'une facture")
    public ApiResponse<List<Payment>> getPayments(@PathVariable Long invoiceId) {
        return ApiResponse.success("Paiements récupérés", financeService.getInvoicePayments(invoiceId));
    }

    // ── ÉCHÉANCIERS ───────────────────────────────────────────────────────

    @PostMapping("/invoices/{invoiceId}/schedule")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER')")
    @Operation(summary = "Créer un échéancier de paiement en N versements")
    public ApiResponse<List<PaymentSchedule>> createSchedule(
            @PathVariable Long invoiceId, @RequestParam int installments) {
        return ApiResponse.success("Échéancier créé", financeService.createSchedule(invoiceId, installments));
    }

    @GetMapping("/invoices/{invoiceId}/schedule")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER','STUDENT')")
    @Operation(summary = "Consulter l'échéancier d'une facture")
    public ApiResponse<List<PaymentSchedule>> getSchedule(@PathVariable Long invoiceId) {
        return ApiResponse.success("Échéancier récupéré", financeService.getSchedule(invoiceId));
    }

    // ── BOURSES ───────────────────────────────────────────────────────────

    @PostMapping("/scholarships")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER')")
    @Operation(summary = "Créer une bourse ou réduction pour un étudiant")
    public ApiResponse<Scholarship> createScholarship(
            @RequestParam Long studentId,
            @RequestParam Long academicYearId,
            @RequestParam String label,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) BigDecimal amount,
            @RequestParam(required = false) Double discountPercentage,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        return ApiResponse.success("Bourse créée",
                financeService.createScholarship(studentId, academicYearId, label, description,
                        amount, discountPercentage, startDate, endDate));
    }

    @PatchMapping("/scholarships/{id}/approve")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER')")
    @Operation(summary = "Approuver une bourse (permet de l'appliquer ensuite à une facture)")
    public ApiResponse<Scholarship> approve(@PathVariable Long id) {
        return ApiResponse.success("Bourse approuvée", financeService.approveScholarship(id));
    }

    @GetMapping("/scholarships/pending")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','SCHOOL_MANAGER')")
    @Operation(summary = "Bourses en attente d'approbation")
    public ApiResponse<List<Scholarship>> getPending() {
        return ApiResponse.success("Bourses en attente", financeService.getPendingScholarships());
    }
}
