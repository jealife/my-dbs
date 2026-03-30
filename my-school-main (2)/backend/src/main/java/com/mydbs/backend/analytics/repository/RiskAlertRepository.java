package com.mydbs.backend.analytics.repository;

import com.mydbs.backend.analytics.model.RiskAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RiskAlertRepository extends JpaRepository<RiskAlert, Long> {
    Page<RiskAlert> findByStudentIdAndArchivedFalseOrderByCreatedAtDesc(Long studentId, Pageable pageable);
    Page<RiskAlert> findByStatusAndArchivedFalseOrderByCreatedAtDesc(String status, Pageable pageable);
    Page<RiskAlert> findByAssignedToIdAndStatusAndArchivedFalse(Long assignedToId, String status, Pageable pageable);
    long countByStatusAndArchivedFalse(String status);
}
