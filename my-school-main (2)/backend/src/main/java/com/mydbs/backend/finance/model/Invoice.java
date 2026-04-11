package com.mydbs.backend.finance.model;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.student.model.Student;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Invoice = facture émise à un étudiant pour ses frais de scolarité (ou autre).
 */
@Entity
@Table(name = "invoices",
        indexes = {
                @Index(name = "idx_invoice_student", columnList = "student_id"),
                @Index(name = "idx_invoice_year", columnList = "academic_year_id"),
                @Index(name = "idx_invoice_status", columnList = "status"),
                @Index(name = "idx_invoice_number", columnList = "invoice_number")
        })
public class Invoice extends BaseAuditEntity {

    @Column(name = "invoice_number", nullable = false, unique = true, length = 50)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_invoice_student"))
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_invoice_year"))
    private AcademicYear academicYear;

    @Column(name = "label", nullable = false, length = 200)
    private String label;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "amount_paid", precision = 12, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "amount_remaining", precision = 12, scale = 2)
    private BigDecimal amountRemaining;

    @Column(name = "currency", nullable = false, length = 5)
    private String currency = "XOF";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "notes", length = 1000)
    private String notes;

    // Getters & Setters
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }
    public BigDecimal getAmountRemaining() { return amountRemaining; }
    public void setAmountRemaining(BigDecimal amountRemaining) { this.amountRemaining = amountRemaining; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public InvoiceStatus getStatus() { return status; }
    public void setStatus(InvoiceStatus status) { this.status = status; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
