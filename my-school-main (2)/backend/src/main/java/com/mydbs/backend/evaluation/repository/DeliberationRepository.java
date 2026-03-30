package com.mydbs.backend.evaluation.repository;

import com.mydbs.backend.evaluation.model.Deliberation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliberationRepository extends JpaRepository<Deliberation, Long> {
    Page<Deliberation> findByCohortIdAndArchivedFalseOrderByScheduledAtDesc(Long cohortId, Pageable pageable);
    Page<Deliberation> findByAcademicYearIdAndArchivedFalseOrderByScheduledAtDesc(Long academicYearId, Pageable pageable);
}
