package com.mydbs.backend.finance.repository;

import com.mydbs.backend.finance.model.TuitionFee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TuitionFeeRepository extends JpaRepository<TuitionFee, Long> {
    Optional<TuitionFee> findByProgramIdAndAcademicYearIdAndArchivedFalse(Long programId, Long academicYearId);
}
