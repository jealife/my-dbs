package com.mydbs.backend.finance.repository;

import com.mydbs.backend.finance.model.Scholarship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScholarshipRepository extends JpaRepository<Scholarship, Long> {
    List<Scholarship> findByStudentIdAndAcademicYearIdAndArchivedFalse(Long studentId, Long academicYearId);
    List<Scholarship> findByApprovedFalseAndArchivedFalseOrderByCreatedAtAsc();
}
