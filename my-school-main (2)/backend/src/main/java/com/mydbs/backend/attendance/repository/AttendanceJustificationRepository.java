package com.mydbs.backend.attendance.repository;

import com.mydbs.backend.attendance.model.AttendanceJustification;
import com.mydbs.backend.attendance.model.JustificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceJustificationRepository extends JpaRepository<AttendanceJustification, Long> {

    Page<AttendanceJustification> findByStudentIdAndArchivedFalseOrderByCreatedAtDesc(Long studentId, Pageable pageable);

    Page<AttendanceJustification> findByStatusAndArchivedFalseOrderByCreatedAtAsc(JustificationStatus status, Pageable pageable);

    long countByStudentIdAndStatusAndArchivedFalse(Long studentId, JustificationStatus status);
}
