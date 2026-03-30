package com.mydbs.backend.grades.repository;

import com.mydbs.backend.grades.model.CreditAcquisition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CreditAcquisitionRepository extends JpaRepository<CreditAcquisition, Long> {
    List<CreditAcquisition> findByStudentIdAndAcademicYearIdAndArchivedFalse(Long studentId, Long academicYearId);

    Optional<CreditAcquisition> findByStudentIdAndCourseIdAndAcademicYearIdAndArchivedFalse(
            Long studentId, Long courseId, Long academicYearId);

    @Query("SELECT COALESCE(SUM(c.creditsEarned), 0) FROM CreditAcquisition c " +
           "WHERE c.student.id = :studentId AND c.academicYear.id = :yearId AND c.archived = false")
    int sumCreditsEarned(@Param("studentId") Long studentId, @Param("yearId") Long yearId);
}
