package com.mydbs.backend.assignment.repository;

import com.mydbs.backend.assignment.model.Assignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    Page<Assignment> findByCourseIdAndArchivedFalseOrderByDueDateDesc(Long courseId, Pageable pageable);
    Page<Assignment> findByCohortIdAndArchivedFalseOrderByDueDateDesc(Long cohortId, Pageable pageable);
    Page<Assignment> findByPublishedTrueAndArchivedFalseOrderByDueDateDesc(Pageable pageable);
    Page<Assignment> findByArchivedFalseOrderByDueDateDesc(Pageable pageable);
}
