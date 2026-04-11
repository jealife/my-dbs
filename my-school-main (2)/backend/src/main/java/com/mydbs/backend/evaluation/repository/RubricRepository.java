package com.mydbs.backend.evaluation.repository;

import com.mydbs.backend.evaluation.model.Rubric;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RubricRepository extends JpaRepository<Rubric, Long> {
    List<Rubric> findByEvaluationIdAndArchivedFalseOrderByOrderIndexAsc(Long evaluationId);
}
