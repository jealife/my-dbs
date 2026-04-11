package com.mydbs.backend.finance.service.impl;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.repository.AcademicYearRepository;
import com.mydbs.backend.common.exception.DuplicateResourceException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.finance.model.*;
import com.mydbs.backend.finance.repository.*;
import com.mydbs.backend.student.model.Student;
import com.mydbs.backend.student.repository.StudentRepository;
import com.mydbs.backend.email.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FinanceServiceImpl {

    private static final Logger log = LoggerFactory.getLogger(FinanceServiceImpl.class);

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentScheduleRepository scheduleRepository;
    private final TuitionFeeRepository tuitionFeeRepository;
    private final ScholarshipRepository scholarshipRepository;
    private final StudentRepository studentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final EmailService emailService;

    public FinanceServiceImpl(InvoiceRepository invoiceRepository,
                               PaymentRepository paymentRepository,
                               PaymentScheduleRepository scheduleRepository,
                               TuitionFeeRepository tuitionFeeRepository,
                               ScholarshipRepository scholarshipRepository,
                               StudentRepository studentRepository,
                               AcademicYearRepository academicYearRepository,
                               EmailService emailService) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.scheduleRepository = scheduleRepository;
        this.tuitionFeeRepository = tuitionFeeRepository;
        this.scholarshipRepository = scholarshipRepository;
        this.studentRepository = studentRepository;
        this.academicYearRepository = academicYearRepository;
        this.emailService = emailService;
    }

    // ─────────────────────── FACTURES ────────────────────────────────────

    public Invoice createInvoice(Long studentId, Long academicYearId, String label,
                                  BigDecimal totalAmount, String currency, LocalDate dueDate, String notes) {
        Student student = findStudent(studentId);
        AcademicYear year = findYear(academicYearId);

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber(academicYearId));
        invoice.setStudent(student);
        invoice.setAcademicYear(year);
        invoice.setLabel(label);
        invoice.setTotalAmount(totalAmount);
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setAmountRemaining(totalAmount);
        invoice.setCurrency(currency != null ? currency : "XOF");
        invoice.setStatus(InvoiceStatus.ISSUED);
        invoice.setIssueDate(LocalDate.now());
        invoice.setDueDate(dueDate);
        invoice.setNotes(notes);

        Invoice saved = invoiceRepository.save(invoice);

        // M17 — Email notification facture créée
        if (student.getEmail() != null) {
            String studentName = student.getFirstName() + " " + student.getLastName();
            emailService.sendInvoiceCreated(student.getEmail(), studentName,
                    saved.getInvoiceNumber(), totalAmount.doubleValue());
        }
        return saved;
    }

    @Transactional(readOnly = true)
    public Page<Invoice> getStudentInvoices(Long studentId, Pageable pageable) {
        findStudent(studentId);
        return invoiceRepository.findByStudentIdAndArchivedFalseOrderByCreatedAtDesc(studentId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Invoice> getByStatus(InvoiceStatus status, Pageable pageable) {
        return invoiceRepository.findByStatusAndArchivedFalseOrderByDueDateAsc(status, pageable);
    }

    @Transactional(readOnly = true)
    public BigDecimal getOutstandingBalance(Long studentId) {
        return invoiceRepository.sumOutstandingByStudent(studentId);
    }

    public Invoice applyScholarship(Long invoiceId, Long scholarshipId) {
        Invoice invoice = findInvoice(invoiceId);
        Scholarship scholarship = scholarshipRepository.findById(scholarshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Bourse introuvable : " + scholarshipId));

        if (!scholarship.isApproved()) throw new IllegalStateException("La bourse n'est pas encore approuvée");

        BigDecimal reduction = BigDecimal.ZERO;
        if (scholarship.getAmount() != null) {
            reduction = scholarship.getAmount();
        } else if (scholarship.getDiscountPercentage() != null) {
            reduction = invoice.getTotalAmount()
                    .multiply(BigDecimal.valueOf(scholarship.getDiscountPercentage() / 100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal newTotal = invoice.getTotalAmount().subtract(reduction).max(BigDecimal.ZERO);
        invoice.setTotalAmount(newTotal);
        recalculateInvoice(invoice);
        scholarship.setAppliedToInvoiceId(invoiceId);
        scholarshipRepository.save(scholarship);
        log.info("Bourse {} appliquée à la facture {} : réduction = {}", scholarshipId, invoiceId, reduction);
        return invoiceRepository.save(invoice);
    }

    // ─────────────────────── PAIEMENTS ───────────────────────────────────

    public Payment recordPayment(Long invoiceId, BigDecimal amount, PaymentMethod method,
                                  LocalDate paymentDate, String transactionId, String notes) {
        Invoice invoice = findInvoice(invoiceId);
        if (invoice.getStatus() == InvoiceStatus.PAID || invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new IllegalStateException("Cette facture ne peut plus recevoir de paiement (statut: " + invoice.getStatus() + ")");
        }

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setPaymentReference(generatePaymentRef());
        payment.setAmount(amount);
        payment.setCurrency(invoice.getCurrency());
        payment.setPaymentMethod(method);
        payment.setPaymentDate(paymentDate != null ? paymentDate : LocalDate.now());
        payment.setStatus(PaymentStatus.PAID);
        payment.setConfirmedAt(LocalDateTime.now());
        payment.setTransactionId(transactionId);
        payment.setReceiptNumber("REC-" + System.currentTimeMillis());
        payment.setNotes(notes);
        Payment saved = paymentRepository.save(payment);

        // Recalculer les soldes de la facture
        BigDecimal totalPaid = paymentRepository.sumPaidByInvoice(invoiceId);
        invoice.setAmountPaid(totalPaid);
        recalculateInvoice(invoice);
        invoiceRepository.save(invoice);

        log.info("Paiement {} enregistré : {} {} — solde restant facture {}: {}",
                saved.getPaymentReference(), amount, invoice.getCurrency(), invoiceId, invoice.getAmountRemaining());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Payment> getInvoicePayments(Long invoiceId) {
        return paymentRepository.findByInvoiceIdAndArchivedFalseOrderByCreatedAtDesc(invoiceId);
    }

    // ─────────────────────── ÉCHÉANCIERS ─────────────────────────────────

    public List<PaymentSchedule> createSchedule(Long invoiceId, int installments) {
        Invoice invoice = findInvoice(invoiceId);
        BigDecimal perInstallment = invoice.getTotalAmount()
                .divide(BigDecimal.valueOf(installments), 2, RoundingMode.HALF_UP);

        List<PaymentSchedule> schedules = new java.util.ArrayList<>();
        for (int i = 1; i <= installments; i++) {
            PaymentSchedule schedule = new PaymentSchedule();
            schedule.setInvoice(invoice);
            schedule.setInstallmentNumber(i);
            schedule.setAmountDue(perInstallment);
            schedule.setAmountPaid(BigDecimal.ZERO);
            schedule.setDueDate(invoice.getIssueDate().plusMonths(i - 1));
            schedule.setStatus(PaymentStatus.PENDING);
            schedules.add(scheduleRepository.save(schedule));
        }
        return schedules;
    }

    @Transactional(readOnly = true)
    public List<PaymentSchedule> getSchedule(Long invoiceId) {
        return scheduleRepository.findByInvoiceIdAndArchivedFalseOrderByInstallmentNumber(invoiceId);
    }

    // ─────────────────────── BOURSES ─────────────────────────────────────

    public Scholarship createScholarship(Long studentId, Long academicYearId, String label,
                                          String description, BigDecimal amount,
                                          Double discountPercent, LocalDate startDate, LocalDate endDate) {
        Student student = findStudent(studentId);
        AcademicYear year = findYear(academicYearId);

        Scholarship scholarship = new Scholarship();
        scholarship.setStudent(student);
        scholarship.setAcademicYear(year);
        scholarship.setLabel(label);
        scholarship.setDescription(description);
        scholarship.setAmount(amount);
        scholarship.setDiscountPercentage(discountPercent);
        scholarship.setStartDate(startDate);
        scholarship.setEndDate(endDate);
        return scholarshipRepository.save(scholarship);
    }

    public Scholarship approveScholarship(Long scholarshipId) {
        Scholarship scholarship = scholarshipRepository.findById(scholarshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Bourse introuvable : " + scholarshipId));
        scholarship.setApproved(true);
        return scholarshipRepository.save(scholarship);
    }

    @Transactional(readOnly = true)
    public List<Scholarship> getPendingScholarships() {
        return scholarshipRepository.findByApprovedFalseAndArchivedFalseOrderByCreatedAtAsc();
    }

    // ─────────────────────── PRIVATE HELPERS ─────────────────────────────

    private void recalculateInvoice(Invoice invoice) {
        BigDecimal remaining = invoice.getTotalAmount().subtract(invoice.getAmountPaid()).max(BigDecimal.ZERO);
        invoice.setAmountRemaining(remaining);

        if (remaining.compareTo(BigDecimal.ZERO) == 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else if (invoice.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(InvoiceStatus.PARTIAL);
        } else if (invoice.getDueDate() != null && LocalDate.now().isAfter(invoice.getDueDate())) {
            invoice.setStatus(InvoiceStatus.OVERDUE);
        }
    }

    private String generateInvoiceNumber(Long yearId) {
        return String.format("INV-%d-%05d", Year.now().getValue(),
                invoiceRepository.count() + 1);
    }

    private String generatePaymentRef() {
        return "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private Student findStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable : " + id));
    }
    private AcademicYear findYear(Long id) {
        return academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Année académique introuvable : " + id));
    }
    private Invoice findInvoice(Long id) {
        Invoice inv = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facture introuvable : " + id));
        if (inv.isArchived()) throw new ResourceNotFoundException("Facture introuvable : " + id);
        return inv;
    }
}
