package com.mydbs.backend.assignment.repository;

import com.mydbs.backend.assignment.model.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttemptRepository extends JpaRepository<Attempt, Long> {
    List<Attempt> findByQuizIdAndStudentIdAndArchivedFalseOrderByAttemptNumberDesc(Long quizId, Long studentId);
    Optional<Attempt> findFirstByQuizIdAndStudentIdAndSubmittedFalseAndArchivedFalse(Long quizId, Long studentId);
    long countByQuizIdAndStudentIdAndArchivedFalse(Long quizId, Long studentId);
    List<Attempt> findByQuizIdAndArchivedFalseOrderByScoreDesc(Long quizId);
}
