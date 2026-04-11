package com.mydbs.backend.evaluation.repository;

import com.mydbs.backend.evaluation.model.EvaluationResult;
import com.mydbs.backend.evaluation.model.ResultStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EvaluationResultRepository extends JpaRepository<EvaluationResult, Long> {

    List<EvaluationResult> findByEvaluationIdAndArchivedFalse(Long evaluationId);

    Optional<EvaluationResult> findByEvaluationIdAndStudentIdAndArchivedFalse(Long evaluationId, Long studentId);

    List<EvaluationResult> findByStudentIdAndArchivedFalse(Long studentId);

    List<EvaluationResult> findByStudentIdAndEvaluationCourseIdAndArchivedFalse(Long studentId, Long courseId);

    List<EvaluationResult> findByEvaluationIdAndStatusAndArchivedFalse(Long evaluationId, ResultStatus status);

    @Query("SELECT COUNT(r) FROM EvaluationResult r WHERE r.evaluation.id = :evalId AND r.status = 'PENDING' AND r.archived = false")
    long countPendingResults(@Param("evalId") Long evaluationId);

    @Query("SELECT AVG(r.score) FROM EvaluationResult r WHERE r.evaluation.id = :evalId AND r.score IS NOT NULL AND r.archived = false")
    Double averageScoreForEvaluation(@Param("evalId") Long evaluationId);
}
