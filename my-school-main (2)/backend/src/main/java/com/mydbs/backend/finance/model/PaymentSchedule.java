package com.mydbs.backend.finance.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * PaymentSchedule = un échéancier (versement attendu) associé à une facture.
 * Permet de gérer le paiement en plusieurs fois.
 */
@Entity
@Table(name = "payment_schedules",
        indexes = {
                @Index(name = "idx_schedule_invoice", columnList = "invoice_id"),
                @Index(name = "idx_schedule_due", columnList = "due_date"),
                @Index(name = "idx_schedule_status", columnList = "status")
        })
public class PaymentSchedule extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invoice_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_schedule_invoice"))
    private Invoice invoice;

    @Column(name = "installment_number", nullable = false)
    private Integer installmentNumber;

    @Column(name = "amount_due", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountDue;

    @Column(name = "amount_paid", precision = 12, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;

    // Getters & Setters
    public Invoice getInvoice() { return invoice; }
    public void setInvoice(Invoice invoice) { this.invoice = invoice; }
    public Integer getInstallmentNumber() { return installmentNumber; }
    public void setInstallmentNumber(Integer installmentNumber) { this.installmentNumber = installmentNumber; }
    public BigDecimal getAmountDue() { return amountDue; }
    public void setAmountDue(BigDecimal amountDue) { this.amountDue = amountDue; }
    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }
}
