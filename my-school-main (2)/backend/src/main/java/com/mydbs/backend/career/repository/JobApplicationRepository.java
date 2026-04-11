package com.mydbs.backend.career.repository;

import com.mydbs.backend.career.model.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    Page<JobApplication> findByStudentIdAndArchivedFalseOrderByCreatedAtDesc(Long studentId, Pageable pageable);
    Page<JobApplication> findByJobOfferIdAndArchivedFalseOrderByCreatedAtDesc(Long offerId, Pageable pageable);
    boolean existsByStudentIdAndJobOfferIdAndArchivedFalse(Long studentId, Long offerId);
}
