package com.mydbs.backend.finance.model;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.student.model.Student;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Scholarship = bourse ou réduction accordée à un étudiant.
 */
@Entity
@Table(name = "scholarships",
        indexes = {
                @Index(name = "idx_scholarship_student", columnList = "student_id"),
                @Index(name = "idx_scholarship_year", columnList = "academic_year_id")
        })
public class Scholarship extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_scholarship_student"))
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_scholarship_year"))
    private AcademicYear academicYear;

    @Column(name = "label", nullable = false, length = 200)
    private String label;

    @Column(name = "description", length = 1000)
    private String description;

    /** Montant fixe de la bourse */
    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount;

    /** Ou pourcentage de réduction sur la scolarité */
    @Column(name = "discount_percentage")
    private Double discountPercentage;

    @Column(name = "currency", length = 5)
    private String currency = "XOF";

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "approved", nullable = false)
    private boolean approved = false;

    @Column(name = "applied_to_invoice_id")
    private Long appliedToInvoiceId;

    // Getters & Setters
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Double getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(Double discountPercentage) { this.discountPercentage = discountPercentage; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public Long getAppliedToInvoiceId() { return appliedToInvoiceId; }
    public void setAppliedToInvoiceId(Long appliedToInvoiceId) { this.appliedToInvoiceId = appliedToInvoiceId; }
}
