package com.mydbs.backend.evaluation.service;

import com.mydbs.backend.evaluation.dto.*;
import com.mydbs.backend.evaluation.model.EvaluationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EvaluationService {

    // ── Evaluations ──────────────────────────────────────────────────────────
    EvaluationResponse create(EvaluationCreateRequest request);
    Page<EvaluationSummaryResponse> getAll(EvaluationStatus status, Long courseId, Long cohortId, Pageable pageable);
    EvaluationResponse getById(Long id);
    EvaluationResponse update(Long id, EvaluationCreateRequest request);
    EvaluationResponse changeStatus(Long id, EvaluationStatus targetStatus);
    void archive(Long id);

    // ── Grade entry ──────────────────────────────────────────────────────────
    EvaluationResultResponse enterGrade(Long evaluationId, GradeEntryRequest request);
    List<EvaluationResultResponse> getResultsByEvaluation(Long evaluationId);
    EvaluationResultResponse getResultByStudent(Long evaluationId, Long studentId);
    EvaluationResultResponse updateGrade(Long resultId, GradeEntryRequest request);
    EvaluationResponse publishResults(Long evaluationId);

    // ── Student view ─────────────────────────────────────────────────────────
    List<EvaluationResultResponse> getMyResults(Long studentId);
    List<EvaluationResultResponse> getStudentResultsByCourse(Long studentId, Long courseId);

    // ── Rubric ───────────────────────────────────────────────────────────────
    RubricResponse addRubricCriterion(Long evaluationId, RubricCreateRequest request);
    List<RubricResponse> getRubric(Long evaluationId);
    void deleteRubricCriterion(Long criterionId);

    // ── Deliberation ─────────────────────────────────────────────────────────
    DeliberationResponse createDeliberation(DeliberationCreateRequest request);
    Page<DeliberationResponse> getDeliberations(Long cohortId, Long academicYearId, Pageable pageable);
    DeliberationResponse getDeliberationById(Long id);
    DeliberationResponse publishDeliberation(Long id);
    void archiveDeliberation(Long id);
}
