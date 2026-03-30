package com.mydbs.backend.grades.repository;

import com.mydbs.backend.grades.model.GradeBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GradeBookRepository extends JpaRepository<GradeBook, Long> {

    Optional<GradeBook> findByStudentIdAndCourseIdAndAcademicYearIdAndArchivedFalse(
            Long studentId, Long courseId, Long academicYearId);

    List<GradeBook> findByStudentIdAndAcademicYearIdAndArchivedFalseOrderByCourseTitle(
            Long studentId, Long academicYearId);

    List<GradeBook> findByStudentIdAndAcademicYearIdAndSemesterAndArchivedFalse(
            Long studentId, Long academicYearId, String semester);

    List<GradeBook> findByCourseIdAndAcademicYearIdAndArchivedFalse(
            Long courseId, Long academicYearId);

    /** Moyenne de toute la cohorte pour un cours/année */
    @Query("SELECT AVG(gb.weightedAverage) FROM GradeBook gb " +
           "WHERE gb.cohort.id = :cohortId AND gb.academicYear.id = :yearId " +
           "AND gb.semester = :semester AND gb.weightedAverage IS NOT NULL AND gb.archived = false")
    Optional<Double> findCohortAverageBySemester(@Param("cohortId") Long cohortId,
                                                  @Param("yearId") Long yearId,
                                                  @Param("semester") String semester);
}
