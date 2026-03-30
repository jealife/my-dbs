package com.mydbs.backend.finance.repository;

import com.mydbs.backend.finance.model.Invoice;
import com.mydbs.backend.finance.model.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Page<Invoice> findByStudentIdAndArchivedFalseOrderByCreatedAtDesc(Long studentId, Pageable pageable);

    Page<Invoice> findByAcademicYearIdAndArchivedFalse(Long academicYearId, Pageable pageable);

    Page<Invoice> findByStatusAndArchivedFalseOrderByDueDateAsc(InvoiceStatus status, Pageable pageable);

    Optional<Invoice> findByInvoiceNumberAndArchivedFalse(String invoiceNumber);

    @Query("SELECT COALESCE(SUM(i.amountRemaining), 0) FROM Invoice i " +
           "WHERE i.student.id = :studentId AND i.status NOT IN ('PAID','CANCELLED') AND i.archived = false")
    BigDecimal sumOutstandingByStudent(@Param("studentId") Long studentId);
}
