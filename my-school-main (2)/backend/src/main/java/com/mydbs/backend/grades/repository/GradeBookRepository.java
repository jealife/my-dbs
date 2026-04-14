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

    @Query("SELECT gb FROM GradeBook gb " +
           "LEFT JOIN FETCH gb.course c " +
           "LEFT JOIN FETCH c.teachingUnit " +
           "WHERE gb.student.id = :studentId AND gb.academicYear.id = :academicYearId " +
           "AND gb.archived = false ORDER BY c.title ASC")
    List<GradeBook> findByStudentIdAndAcademicYearIdAndArchivedFalseOrderByCourseTitle(
            @Param("studentId") Long studentId,
            @Param("academicYearId") Long academicYearId);

    @Query("SELECT gb FROM GradeBook gb " +
           "LEFT JOIN FETCH gb.course c " +
           "LEFT JOIN FETCH c.teachingUnit " +
           "WHERE gb.student.id = :studentId AND gb.archived = false ORDER BY c.title ASC")
    List<GradeBook> findByStudentIdAndArchivedFalseOrderByCourseTitle(
            @Param("studentId") Long studentId);

    @Query("SELECT gb FROM GradeBook gb " +
           "LEFT JOIN FETCH gb.course c " +
           "LEFT JOIN FETCH c.teachingUnit " +
           "WHERE gb.student.id = :studentId AND gb.academicYear.id = :academicYearId " +
           "AND gb.semester = :semester AND gb.archived = false " +
           "ORDER BY c.title ASC")
    List<GradeBook> findByStudentIdAndAcademicYearIdAndSemesterAndArchivedFalse(
            @Param("studentId") Long studentId,
            @Param("academicYearId") Long academicYearId,
            @Param("semester") String semester);

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
