package com.mydbs.backend.attendance.repository;

import com.mydbs.backend.attendance.model.AttendanceRecord;
import com.mydbs.backend.attendance.model.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    List<AttendanceRecord> findBySessionIdAndArchivedFalse(Long sessionId);

    List<AttendanceRecord> findByStudentIdAndArchivedFalseOrderByCreatedAtDesc(Long studentId);

    Optional<AttendanceRecord> findBySessionIdAndStudentIdAndArchivedFalse(Long sessionId, Long studentId);

    List<AttendanceRecord> findBySessionIdAndStatusAndArchivedFalse(Long sessionId, AttendanceStatus status);

    // Taux de présence par étudiant : count(PRESENT + LATE + REMOTE) / count(total)
    @Query("SELECT COUNT(a) FROM AttendanceRecord a WHERE a.student.id = :studentId AND a.archived = false")
    long countTotalByStudent(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(a) FROM AttendanceRecord a WHERE a.student.id = :studentId " +
           "AND a.status IN ('PRESENT','LATE','REMOTE','EXCUSED') AND a.archived = false")
    long countPresentByStudent(@Param("studentId") Long studentId);

    // Stats par cours (via session → course)
    @Query("SELECT COUNT(a) FROM AttendanceRecord a WHERE a.student.id = :studentId " +
           "AND a.session.course.id = :courseId AND a.archived = false")
    long countTotalByStudentAndCourse(@Param("studentId") Long studentId, @Param("courseId") Long courseId);

    @Query("SELECT COUNT(a) FROM AttendanceRecord a WHERE a.student.id = :studentId " +
           "AND a.session.course.id = :courseId " +
           "AND a.status IN ('PRESENT','LATE','REMOTE','EXCUSED') AND a.archived = false")
    long countPresentByStudentAndCourse(@Param("studentId") Long studentId, @Param("courseId") Long courseId);
}
