package com.mydbs.backend.evaluation.repository;

import com.mydbs.backend.evaluation.model.Evaluation;
import com.mydbs.backend.evaluation.model.EvaluationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    Page<Evaluation> findByArchivedFalseOrderByScheduledAtDesc(Pageable pageable);

    Page<Evaluation> findByCourseIdAndArchivedFalseOrderByScheduledAtDesc(Long courseId, Pageable pageable);

    Page<Evaluation> findByCohortIdAndArchivedFalseOrderByScheduledAtDesc(Long cohortId, Pageable pageable);

    Page<Evaluation> findByStatusAndArchivedFalseOrderByScheduledAtDesc(EvaluationStatus status, Pageable pageable);

    List<Evaluation> findByCourseIdAndAcademicYearIdAndArchivedFalse(Long courseId, Long academicYearId);
}
