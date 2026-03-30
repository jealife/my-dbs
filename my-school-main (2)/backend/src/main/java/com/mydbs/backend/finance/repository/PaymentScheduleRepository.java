package com.mydbs.backend.finance.repository;

import com.mydbs.backend.finance.model.PaymentSchedule;
import com.mydbs.backend.finance.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PaymentScheduleRepository extends JpaRepository<PaymentSchedule, Long> {
    List<PaymentSchedule> findByInvoiceIdAndArchivedFalseOrderByInstallmentNumber(Long invoiceId);
    List<PaymentSchedule> findByStatusAndDueDateBeforeAndArchivedFalse(PaymentStatus status, LocalDate date);
}
