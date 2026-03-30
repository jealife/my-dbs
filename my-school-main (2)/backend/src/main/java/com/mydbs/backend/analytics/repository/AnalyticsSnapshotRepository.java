package com.mydbs.backend.analytics.repository;

import com.mydbs.backend.analytics.model.AnalyticsSnapshot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnalyticsSnapshotRepository extends JpaRepository<AnalyticsSnapshot, Long> {

    Page<AnalyticsSnapshot> findByStudentIdAndArchivedFalseOrderByCreatedAtDesc(Long studentId, Pageable pageable);

    Page<AnalyticsSnapshot> findByCohortIdAndArchivedFalseOrderByDropoutRiskScoreDesc(Long cohortId, Pageable pageable);

    Optional<AnalyticsSnapshot> findTopByStudentIdAndAcademicYearIdAndScopeOrderByCreatedAtDesc(
            Long studentId, Long academicYearId, String scope);
}
