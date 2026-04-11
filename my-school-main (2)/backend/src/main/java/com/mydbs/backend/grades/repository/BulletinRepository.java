package com.mydbs.backend.grades.repository;

import com.mydbs.backend.grades.model.Bulletin;
import com.mydbs.backend.grades.model.BulletinStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BulletinRepository extends JpaRepository<Bulletin, Long> {

    Optional<Bulletin> findByStudentIdAndSemesterAndAcademicYearIdAndArchivedFalse(
            Long studentId, String semester, Long academicYearId);

    List<Bulletin> findByStudentIdAndArchivedFalseOrderByCreatedAtDesc(Long studentId);

    Page<Bulletin> findByCohortIdAndAcademicYearIdAndSemesterAndArchivedFalse(
            Long cohortId, Long academicYearId, String semester, Pageable pageable);

    List<Bulletin> findByCohortIdAndAcademicYearIdAndSemesterAndArchivedFalse(
            Long cohortId, Long academicYearId, String semester);

    /** Classement : liste des bulletins triée par généralAverage desc pour rang */
    @Query("SELECT b FROM Bulletin b WHERE b.cohort.id = :cohortId " +
           "AND b.academicYear.id = :yearId AND b.semester = :semester " +
           "AND b.generalAverage IS NOT NULL AND b.archived = false " +
           "ORDER BY b.generalAverage DESC")
    List<Bulletin> findForRankingByCohort(@Param("cohortId") Long cohortId,
                                           @Param("yearId") Long yearId,
                                           @Param("semester") String semester);

    long countByStatusAndArchivedFalse(BulletinStatus status);
}
