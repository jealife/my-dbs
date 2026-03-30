package com.mydbs.backend.assignment.repository;

import com.mydbs.backend.assignment.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByAssignmentIdAndArchivedFalseOrderByVersionNumberDesc(Long assignmentId);
    List<Submission> findByStudentIdAndArchivedFalseOrderByCreatedAtDesc(Long studentId);
    Optional<Submission> findByAssignmentIdAndStudentIdAndLatestTrueAndArchivedFalse(Long assignmentId, Long studentId);
    List<Submission> findByAssignmentIdAndStudentIdAndArchivedFalseOrderByVersionNumberDesc(Long assignmentId, Long studentId);
    long countByAssignmentIdAndArchivedFalse(Long assignmentId);
}
