package com.mydbs.backend.finance.repository;

import com.mydbs.backend.finance.model.Payment;
import com.mydbs.backend.finance.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoiceIdAndArchivedFalseOrderByCreatedAtDesc(Long invoiceId);
    Optional<Payment> findByPaymentReferenceAndArchivedFalse(String ref);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p " +
           "WHERE p.invoice.id = :invoiceId AND p.status = 'PAID' AND p.archived = false")
    BigDecimal sumPaidByInvoice(@Param("invoiceId") Long invoiceId);
}
