package com.mydbs.backend.assignment.repository;

import com.mydbs.backend.assignment.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Optional<Quiz> findByAssignmentIdAndArchivedFalse(Long assignmentId);
}
