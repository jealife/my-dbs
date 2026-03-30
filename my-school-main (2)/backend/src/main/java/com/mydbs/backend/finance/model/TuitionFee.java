package com.mydbs.backend.finance.model;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.Program;
import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;

/**
 * TuitionFee = barème des frais de scolarité pour un programme et une année académique.
 * Sert de référence pour la génération des factures.
 */
@Entity
@Table(name = "tuition_fees",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_tuition_program_year",
                        columnNames = {"program_id", "academic_year_id"})
        },
        indexes = {
                @Index(name = "idx_tuition_program", columnList = "program_id"),
                @Index(name = "idx_tuition_year", columnList = "academic_year_id")
        })
public class TuitionFee extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "program_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_tuition_program"))
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_tuition_year"))
    private AcademicYear academicYear;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 5)
    private String currency = "XOF";

    @Column(name = "label", nullable = false, length = 200)
    private String label;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "due_installments")
    private Integer dueInstallments = 1;   // Nombre de versements autorisés

    // Getters & Setters
    public Program getProgram() { return program; }
    public void setProgram(Program program) { this.program = program; }
    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDueInstallments() { return dueInstallments; }
    public void setDueInstallments(Integer dueInstallments) { this.dueInstallments = dueInstallments; }
}
