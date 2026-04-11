package com.mydbs.backend.admissions.repository;

import com.mydbs.backend.admissions.model.AdmissionApplication;
import com.mydbs.backend.admissions.model.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdmissionApplicationRepository extends JpaRepository<AdmissionApplication, Long> {

    Page<AdmissionApplication> findByArchivedFalseOrderByCreatedAtDesc(Pageable pageable);

    Page<AdmissionApplication> findByStatusAndArchivedFalseOrderByPriorityDescCreatedAtDesc(
            ApplicationStatus status, Pageable pageable);

    Optional<AdmissionApplication> findByApplicationNumberIgnoreCase(String applicationNumber);

    boolean existsByEmailAndAcademicYearIdAndProgramIdAndArchivedFalse(
            String email, Long academicYearId, Long programId);

    Optional<AdmissionApplication> findTopByApplicationNumberStartingWithOrderByApplicationNumberDesc(String prefix);

    boolean existsByApplicationNumber(String applicationNumber);
}
