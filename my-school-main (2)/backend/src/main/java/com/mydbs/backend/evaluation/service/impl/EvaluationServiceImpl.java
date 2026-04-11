package com.mydbs.backend.evaluation.service.impl;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.ClassRoom;
import com.mydbs.backend.academic.model.Cohort;
import com.mydbs.backend.academic.repository.AcademicYearRepository;
import com.mydbs.backend.academic.repository.ClassRoomRepository;
import com.mydbs.backend.academic.repository.CohortRepository;
import com.mydbs.backend.common.exception.DuplicateResourceException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.course.model.Course;
import com.mydbs.backend.course.repository.CourseRepository;
import com.mydbs.backend.evaluation.dto.*;
import com.mydbs.backend.evaluation.model.*;
import com.mydbs.backend.evaluation.repository.*;
import com.mydbs.backend.evaluation.service.EvaluationService;
import com.mydbs.backend.student.model.Student;
import com.mydbs.backend.student.repository.StudentRepository;
import com.mydbs.backend.user.model.User;
import com.mydbs.backend.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class EvaluationServiceImpl implements EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final EvaluationResultRepository resultRepository;
    private final RubricRepository rubricRepository;
    private final DeliberationRepository deliberationRepository;
    private final CourseRepository courseRepository;
    private final AcademicYearRepository academicYearRepository;
    private final CohortRepository cohortRepository;
    private final ClassRoomRepository classRoomRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public EvaluationServiceImpl(EvaluationRepository evaluationRepository,
                                 EvaluationResultRepository resultRepository,
                                 RubricRepository rubricRepository,
                                 DeliberationRepository deliberationRepository,
                                 CourseRepository courseRepository,
                                 AcademicYearRepository academicYearRepository,
                                 CohortRepository cohortRepository,
                                 ClassRoomRepository classRoomRepository,
                                 StudentRepository studentRepository,
                                 UserRepository userRepository) {
        this.evaluationRepository = evaluationRepository;
        this.resultRepository = resultRepository;
        this.rubricRepository = rubricRepository;
        this.deliberationRepository = deliberationRepository;
        this.courseRepository = courseRepository;
        this.academicYearRepository = academicYearRepository;
        this.cohortRepository = cohortRepository;
        this.classRoomRepository = classRoomRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    // ─────────────────────── EVALUATIONS CRUD ───────────────────────────────

    @Override
    public EvaluationResponse create(EvaluationCreateRequest request) {
        Course course = findCourse(request.courseId());
        AcademicYear academicYear = findAcademicYear(request.academicYearId());
        Cohort cohort = request.cohortId() != null ? findCohort(request.cohortId()) : null;
        ClassRoom classRoom = request.classRoomId() != null ? findClassRoom(request.classRoomId()) : null;

        Evaluation eval = new Evaluation();
        applyEvaluationData(eval, request, course, academicYear, cohort, classRoom);
        return toFullResponse(evaluationRepository.save(eval));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EvaluationSummaryResponse> getAll(EvaluationStatus status, Long courseId, Long cohortId, Pageable pageable) {
        Page<Evaluation> page;
        if (courseId != null) {
            page = evaluationRepository.findByCourseIdAndArchivedFalseOrderByScheduledAtDesc(courseId, pageable);
        } else if (cohortId != null) {
            page = evaluationRepository.findByCohortIdAndArchivedFalseOrderByScheduledAtDesc(cohortId, pageable);
        } else if (status != null) {
            page = evaluationRepository.findByStatusAndArchivedFalseOrderByScheduledAtDesc(status, pageable);
        } else {
            page = evaluationRepository.findByArchivedFalseOrderByScheduledAtDesc(pageable);
        }
        return page.map(this::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public EvaluationResponse getById(Long id) {
        return toFullResponse(findActive(id));
    }

    @Override
    public EvaluationResponse update(Long id, EvaluationCreateRequest request) {
        Evaluation eval = findActive(id);
        if (eval.getStatus() != EvaluationStatus.DRAFT && eval.getStatus() != EvaluationStatus.SCHEDULED) {
            throw new IllegalArgumentException("Impossible de modifier une évaluation en statut " + eval.getStatus());
        }
        Course course = findCourse(request.courseId());
        AcademicYear academicYear = findAcademicYear(request.academicYearId());
        Cohort cohort = request.cohortId() != null ? findCohort(request.cohortId()) : null;
        ClassRoom classRoom = request.classRoomId() != null ? findClassRoom(request.classRoomId()) : null;
        applyEvaluationData(eval, request, course, academicYear, cohort, classRoom);
        return toFullResponse(evaluationRepository.save(eval));
    }

    @Override
    public EvaluationResponse changeStatus(Long id, EvaluationStatus targetStatus) {
        Evaluation eval = findActive(id);
        validateStatusTransition(eval.getStatus(), targetStatus);

        if (targetStatus == EvaluationStatus.RESULTS_PUBLISHED) {
            eval.setResultsPublishedAt(LocalDateTime.now());
            // Publish all graded results
            List<EvaluationResult> results = resultRepository.findByEvaluationIdAndArchivedFalse(id);
            results.forEach(r -> {
                if (r.getStatus() == ResultStatus.GRADED) {
                    r.setStatus(ResultStatus.PUBLISHED);
                    resultRepository.save(r);
                }
            });
        }

        eval.setStatus(targetStatus);
        return toFullResponse(evaluationRepository.save(eval));
    }

    @Override
    public void archive(Long id) {
        Evaluation eval = findActive(id);
        eval.setArchived(true);
        evaluationRepository.save(eval);
    }

    // ─────────────────────── GRADE ENTRY ────────────────────────────────────

    @Override
    public EvaluationResultResponse enterGrade(Long evaluationId, GradeEntryRequest request) {
        Evaluation eval = findActive(evaluationId);
        if (eval.getStatus() != EvaluationStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("La saisie de notes n'est possible qu'en statut IN_PROGRESS");
        }

        Student student = findStudent(request.studentId());

        // Empêcher doublon
        resultRepository.findByEvaluationIdAndStudentIdAndArchivedFalse(evaluationId, request.studentId())
                .ifPresent(r -> { throw new DuplicateResourceException("Une note existe déjà pour cet étudiant dans cette évaluation"); });

        EvaluationResult result = new EvaluationResult();
        result.setEvaluation(eval);
        result.setStudent(student);
        result.setMaxScore(eval.getMaxScore());
        applyGradeData(result, request, eval.getMaxScore());

        return toResultResponse(resultRepository.save(result));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluationResultResponse> getResultsByEvaluation(Long evaluationId) {
        findActive(evaluationId);
        return resultRepository.findByEvaluationIdAndArchivedFalse(evaluationId)
                .stream().map(this::toResultResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EvaluationResultResponse getResultByStudent(Long evaluationId, Long studentId) {
        return resultRepository.findByEvaluationIdAndStudentIdAndArchivedFalse(evaluationId, studentId)
                .map(this::toResultResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Résultat introuvable pour cet étudiant"));
    }

    @Override
    public EvaluationResultResponse updateGrade(Long resultId, GradeEntryRequest request) {
        EvaluationResult result = resultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException("Résultat introuvable avec l'id : " + resultId));
        if (result.getStatus() == ResultStatus.PUBLISHED) {
            throw new IllegalArgumentException("Impossible de modifier un résultat déjà publié");
        }
        applyGradeData(result, request, result.getMaxScore());
        return toResultResponse(resultRepository.save(result));
    }

    @Override
    public EvaluationResponse publishResults(Long evaluationId) {
        return changeStatus(evaluationId, EvaluationStatus.RESULTS_PUBLISHED);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluationResultResponse> getMyResults(Long studentId) {
        return resultRepository.findByStudentIdAndArchivedFalse(studentId)
                .stream()
                .filter(r -> r.getStatus() == ResultStatus.PUBLISHED)
                .map(this::toResultResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluationResultResponse> getStudentResultsByCourse(Long studentId, Long courseId) {
        return resultRepository.findByStudentIdAndEvaluationCourseIdAndArchivedFalse(studentId, courseId)
                .stream()
                .filter(r -> r.getStatus() == ResultStatus.PUBLISHED)
                .map(this::toResultResponse).toList();
    }

    // ─────────────────────── RUBRIC ─────────────────────────────────────────

    @Override
    public RubricResponse addRubricCriterion(Long evaluationId, RubricCreateRequest request) {
        Evaluation eval = findActive(evaluationId);
        Rubric rubric = new Rubric();
        rubric.setEvaluation(eval);
        rubric.setCriterionName(request.criterionName());
        rubric.setDescription(request.description());
        rubric.setMaxPoints(request.maxPoints());
        rubric.setWeightPercentage(request.weightPercentage() != null ? request.weightPercentage() : 100.0);
        rubric.setOrderIndex(request.orderIndex() != null ? request.orderIndex() : 0);
        return toRubricResponse(rubricRepository.save(rubric));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RubricResponse> getRubric(Long evaluationId) {
        findActive(evaluationId);
        return rubricRepository.findByEvaluationIdAndArchivedFalseOrderByOrderIndexAsc(evaluationId)
                .stream().map(this::toRubricResponse).toList();
    }

    @Override
    public void deleteRubricCriterion(Long criterionId) {
        Rubric rubric = rubricRepository.findById(criterionId)
                .orElseThrow(() -> new ResourceNotFoundException("Critère introuvable avec l'id : " + criterionId));
        rubric.setArchived(true);
        rubricRepository.save(rubric);
    }

    // ─────────────────────── DELIBERATION ───────────────────────────────────

    @Override
    public DeliberationResponse createDeliberation(DeliberationCreateRequest request) {
        Cohort cohort = findCohort(request.cohortId());
        AcademicYear academicYear = findAcademicYear(request.academicYearId());
        User president = request.presidentUserId() != null
                ? userRepository.findById(request.presidentUserId()).orElse(null) : null;

        Deliberation delib = new Deliberation();
        delib.setTitle(request.title());
        delib.setSemester(request.semester());
        delib.setScheduledAt(request.scheduledAt());
        delib.setNotes(request.notes());
        delib.setCohort(cohort);
        delib.setAcademicYear(academicYear);
        delib.setPresident(president);

        return toDeliberationResponse(deliberationRepository.save(delib));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DeliberationResponse> getDeliberations(Long cohortId, Long academicYearId, Pageable pageable) {
        Page<Deliberation> page = cohortId != null
                ? deliberationRepository.findByCohortIdAndArchivedFalseOrderByScheduledAtDesc(cohortId, pageable)
                : deliberationRepository.findByAcademicYearIdAndArchivedFalseOrderByScheduledAtDesc(academicYearId, pageable);
        return page.map(this::toDeliberationResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliberationResponse getDeliberationById(Long id) {
        return toDeliberationResponse(findActiveDeliberation(id));
    }

    @Override
    public DeliberationResponse publishDeliberation(Long id) {
        Deliberation delib = findActiveDeliberation(id);
        delib.setPublished(true);
        delib.setClosedAt(LocalDateTime.now());
        return toDeliberationResponse(deliberationRepository.save(delib));
    }

    @Override
    public void archiveDeliberation(Long id) {
        Deliberation delib = findActiveDeliberation(id);
        delib.setArchived(true);
        deliberationRepository.save(delib);
    }

    // ─────────────────────── PRIVATE HELPERS ────────────────────────────────

    private void validateStatusTransition(EvaluationStatus current, EvaluationStatus target) {
        boolean valid = switch (current) {
            case DRAFT -> target == EvaluationStatus.SCHEDULED;
            case SCHEDULED -> target == EvaluationStatus.IN_PROGRESS || target == EvaluationStatus.DRAFT;
            case IN_PROGRESS -> target == EvaluationStatus.CLOSED;
            case CLOSED -> target == EvaluationStatus.RESULTS_PUBLISHED;
            case RESULTS_PUBLISHED -> false;
        };
        if (!valid) {
            throw new IllegalArgumentException("Transition invalide : " + current + " → " + target);
        }
    }

    private void applyEvaluationData(Evaluation eval, EvaluationCreateRequest request,
                                       Course course, AcademicYear academicYear,
                                       Cohort cohort, ClassRoom classRoom) {
        eval.setTitle(request.title());
        eval.setDescription(request.description());
        eval.setEvaluationType(request.evaluationType());
        eval.setMaxScore(request.maxScore());
        eval.setPassingScore(request.passingScore() != null ? request.passingScore() : request.maxScore() / 2.0);
        eval.setWeightPercentage(request.weightPercentage());
        eval.setScheduledAt(request.scheduledAt());
        eval.setDurationMinutes(request.durationMinutes());
        eval.setRoomInfo(request.roomInfo());
        eval.setInstructions(request.instructions());
        eval.setSemester(request.semester());
        eval.setCourse(course);
        eval.setAcademicYear(academicYear);
        eval.setCohort(cohort);
        eval.setClassRoom(classRoom);
    }

    private void applyGradeData(EvaluationResult result, GradeEntryRequest request, Double maxScore) {
        if (request.score() != null && request.score() > maxScore) {
            throw new IllegalArgumentException(
                    "La note " + request.score() + " dépasse la note maximale " + maxScore);
        }
        result.setScore(request.score());
        if (request.status() != null) {
            result.setStatus(request.status());
        } else if (request.score() != null) {
            result.setStatus(ResultStatus.GRADED);
            result.setGradedAt(LocalDateTime.now());
        }
        result.setTeacherComment(request.teacherComment());
    }

    private Evaluation findActive(Long id) {
        Evaluation eval = evaluationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Évaluation introuvable avec l'id : " + id));
        if (eval.isArchived()) throw new ResourceNotFoundException("Évaluation introuvable avec l'id : " + id);
        return eval;
    }

    private Deliberation findActiveDeliberation(Long id) {
        Deliberation d = deliberationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Délibération introuvable avec l'id : " + id));
        if (d.isArchived()) throw new ResourceNotFoundException("Délibération introuvable avec l'id : " + id);
        return d;
    }

    private Course findCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable avec l'id : " + id));
    }

    private AcademicYear findAcademicYear(Long id) {
        return academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Année académique introuvable avec l'id : " + id));
    }

    private Cohort findCohort(Long id) {
        return cohortRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cohorte introuvable avec l'id : " + id));
    }

    private ClassRoom findClassRoom(Long id) {
        return classRoomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classe introuvable avec l'id : " + id));
    }

    private Student findStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable avec l'id : " + id));
    }

    // ─────────────────────── MAPPERS ────────────────────────────────────────

    private EvaluationResponse toFullResponse(Evaluation eval) {
        long total = resultRepository.findByEvaluationIdAndArchivedFalse(eval.getId()).size();
        long graded = resultRepository.findByEvaluationIdAndStatusAndArchivedFalse(eval.getId(), ResultStatus.GRADED).size()
                + resultRepository.findByEvaluationIdAndStatusAndArchivedFalse(eval.getId(), ResultStatus.PUBLISHED).size();
        Double avg = resultRepository.averageScoreForEvaluation(eval.getId());

        return new EvaluationResponse(
                eval.getId(), eval.getTitle(), eval.getDescription(),
                eval.getEvaluationType(), eval.getStatus(),
                eval.getMaxScore(), eval.getPassingScore(),
                eval.getWeightPercentage(), eval.getScheduledAt(), eval.getDurationMinutes(),
                eval.getRoomInfo(), eval.getInstructions(), eval.getSemester(),
                eval.getResultsPublishedAt(),
                eval.getCourse().getId(), eval.getCourse().getTitle(), eval.getCourse().getCode(),
                eval.getAcademicYear().getId(), eval.getAcademicYear().getName(),
                eval.getCohort() != null ? eval.getCohort().getId() : null,
                eval.getCohort() != null ? eval.getCohort().getName() : null,
                eval.getClassRoom() != null ? eval.getClassRoom().getId() : null,
                eval.getClassRoom() != null ? eval.getClassRoom().getName() : null,
                eval.getCreatedByUser() != null ? eval.getCreatedByUser().getId() : null,
                total, graded, avg,
                eval.getCreatedAt(), eval.getUpdatedAt(), eval.getCreatedBy()
        );
    }

    private EvaluationSummaryResponse toSummaryResponse(Evaluation eval) {
        long total = resultRepository.findByEvaluationIdAndArchivedFalse(eval.getId()).size();
        long graded = resultRepository.findByEvaluationIdAndStatusAndArchivedFalse(eval.getId(), ResultStatus.GRADED).size();
        Double avg = resultRepository.averageScoreForEvaluation(eval.getId());

        return new EvaluationSummaryResponse(
                eval.getId(), eval.getTitle(), eval.getEvaluationType(), eval.getStatus(),
                eval.getMaxScore(), eval.getScheduledAt(),
                eval.getCourse().getTitle(), eval.getCourse().getCode(),
                total, graded, avg, eval.getCreatedAt()
        );
    }

    private EvaluationResultResponse toResultResponse(EvaluationResult r) {
        Double pct = (r.getScore() != null && r.getMaxScore() != null && r.getMaxScore() > 0)
                ? Math.round((r.getScore() / r.getMaxScore()) * 10000.0) / 100.0 : null;
        return new EvaluationResultResponse(
                r.getId(),
                r.getEvaluation().getId(),
                r.getEvaluation().getTitle(),
                r.getStudent().getId(),
                r.getStudent().getFirstName(),
                r.getStudent().getLastName(),
                r.getStudent().getStudentNumber(),
                r.getScore(), r.getMaxScore(), pct,
                r.getStatus(), r.getTeacherComment(), r.isCompensated(),
                r.getGradedAt(), r.getCreatedAt()
        );
    }

    private RubricResponse toRubricResponse(Rubric rubric) {
        return new RubricResponse(rubric.getId(), rubric.getCriterionName(), rubric.getDescription(),
                rubric.getMaxPoints(), rubric.getWeightPercentage(), rubric.getOrderIndex(), rubric.getCreatedAt());
    }

    private DeliberationResponse toDeliberationResponse(Deliberation d) {
        return new DeliberationResponse(
                d.getId(), d.getTitle(), d.getSemester(), d.isPublished(),
                d.getScheduledAt(), d.getClosedAt(), d.getNotes(),
                d.getCohort().getId(), d.getCohort().getName(),
                d.getAcademicYear().getId(), d.getAcademicYear().getName(),
                d.getPresident() != null ? d.getPresident().getId() : null,
                d.getCreatedAt(), d.getCreatedBy()
        );
    }
}
