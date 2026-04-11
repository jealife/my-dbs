package com.mydbs.backend.assignment.controller;

import com.mydbs.backend.assignment.dto.*;
import com.mydbs.backend.assignment.service.impl.AssignmentServiceImpl;
import com.mydbs.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assignments")
@CrossOrigin(origins = "*")
@Tag(name = "Assignments & Quizzes", description = "Gestion des devoirs, fichiers soumis, quiz et tentatives")
public class AssignmentController {

    private final AssignmentServiceImpl assignmentService;

    public AssignmentController(AssignmentServiceImpl assignmentService) {
        this.assignmentService = assignmentService;
    }

    // ─────────────────────── ASSIGNMENTS ────────────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Créer un devoir")
    public ApiResponse<AssignmentResponse> create(@Valid @RequestBody AssignmentCreateRequest request) {
        return ApiResponse.success("Devoir créé", assignmentService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Lister les devoirs", description = "Filtres: courseId, cohortId, publishedOnly")
    public ApiResponse<Page<AssignmentResponse>> getAll(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long cohortId,
            @RequestParam(defaultValue = "false") boolean publishedOnly,
            @PageableDefault(size = 20, sort = "dueDate") Pageable pageable) {
        return ApiResponse.success("Liste des devoirs",
                assignmentService.getAll(courseId, cohortId, publishedOnly, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','SCHOOL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Détail d'un devoir")
    public ApiResponse<AssignmentResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Devoir récupéré", assignmentService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Modifier un devoir")
    public ApiResponse<AssignmentResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AssignmentCreateRequest request) {
        return ApiResponse.success("Devoir mis à jour", assignmentService.update(id, request));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Publier un devoir (visible par les étudiants)")
    public ApiResponse<AssignmentResponse> publish(@PathVariable Long id) {
        return ApiResponse.success("Devoir publié", assignmentService.publish(id));
    }

    @PatchMapping("/{id}/publish-results")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Publier les résultats d'un devoir")
    public ApiResponse<AssignmentResponse> publishResults(@PathVariable Long id) {
        return ApiResponse.success("Résultats publiés", assignmentService.publishResults(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER')")
    @Operation(summary = "Archiver un devoir (soft delete)")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        assignmentService.archive(id);
        return ApiResponse.success("Devoir archivé", null);
    }

    // ─────────────────────── SUBMISSIONS ────────────────────────────────────

    @PostMapping(value = "/{id}/submissions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','STUDENT','TEACHER')")
    @Operation(summary = "Soumettre un devoir (avec ou sans fichier)", description = "Upload multipart. Détecte automatiquement si soumission tardive.")
    public ApiResponse<SubmissionResponse> submit(
            @PathVariable Long id,
            @RequestParam Long studentId,
            @RequestParam(required = false) String content,
            @RequestPart(required = false) MultipartFile file) {
        return ApiResponse.success("Devoir soumis", assignmentService.submit(id, studentId, content, file));
    }

    @GetMapping("/{id}/submissions")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Toutes les soumissions d'un devoir (dernière version)")
    public ApiResponse<List<SubmissionResponse>> getSubmissions(@PathVariable Long id) {
        return ApiResponse.success("Soumissions récupérées", assignmentService.getSubmissionsByAssignment(id));
    }

    @GetMapping("/{id}/submissions/student/{studentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Soumission d'un étudiant (dernière version)")
    public ApiResponse<SubmissionResponse> getMySubmission(
            @PathVariable Long id, @PathVariable Long studentId) {
        return ApiResponse.success("Soumission récupérée", assignmentService.getMySubmission(id, studentId));
    }

    @PatchMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Corriger et noter une soumission (pénalité retard appliquée automatiquement)")
    public ApiResponse<SubmissionResponse> grade(
            @PathVariable Long submissionId,
            @RequestParam Double score,
            @RequestParam(required = false) String feedback) {
        return ApiResponse.success("Note attribuée", assignmentService.gradeSubmission(submissionId, score, feedback));
    }

    @PatchMapping("/submissions/{submissionId}/return")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Rendre la soumission corrigée à l'étudiant")
    public ApiResponse<SubmissionResponse> returnSubmission(@PathVariable Long submissionId) {
        return ApiResponse.success("Soumission retournée", assignmentService.returnSubmission(submissionId));
    }

    // ─────────────────────── QUIZ SETUP ─────────────────────────────────────

    @PostMapping("/{id}/quiz")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Associer un quiz à un devoir")
    public ApiResponse<Void> linkQuiz(
            @PathVariable Long id,
            @RequestParam(required = false) Integer timeLimitMinutes,
            @RequestParam(defaultValue = "50.0") Double passingPercentage,
            @RequestParam(defaultValue = "false") boolean randomizeQuestions,
            @RequestParam(defaultValue = "false") boolean showCorrectAnswers) {
        assignmentService.linkQuiz(id, timeLimitMinutes, passingPercentage, randomizeQuestions, showCorrectAnswers);
        return ApiResponse.success("Quiz associé au devoir", null);
    }

    @PostMapping("/{id}/quiz/questions")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER')")
    @Operation(summary = "Ajouter une question au quiz")
    public ApiResponse<QuestionResponse> addQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionCreateRequest request) {
        return ApiResponse.success("Question ajoutée", assignmentService.addQuestion(id, request));
    }

    @GetMapping("/{id}/quiz/questions")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Lister les questions du quiz")
    public ApiResponse<List<QuestionResponse>> getQuestions(@PathVariable Long id) {
        return ApiResponse.success("Questions récupérées", assignmentService.getQuestions(id));
    }

    // ─────────────────────── QUIZ ATTEMPTS ──────────────────────────────────

    @PostMapping("/{id}/quiz/start")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','STUDENT')")
    @Operation(summary = "Démarrer une tentative de quiz")
    public ApiResponse<AttemptResponse> startAttempt(
            @PathVariable Long id,
            @RequestParam Long studentId) {
        return ApiResponse.success("Tentative démarrée", assignmentService.startQuizAttempt(id, studentId));
    }

    @PostMapping("/quiz/attempts/{attemptId}/submit")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','STUDENT')")
    @Operation(summary = "Soumettre les réponses d'un quiz (correction automatique pour QCM/Vrai-Faux)")
    public ApiResponse<AttemptResponse> submitAttempt(
            @PathVariable Long attemptId,
            @Valid @RequestBody QuizSubmitRequest request) {
        return ApiResponse.success("Quiz soumis et corrigé", assignmentService.submitQuizAttempt(attemptId, request));
    }

    @GetMapping("/{id}/quiz/attempts/student/{studentId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN','ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT')")
    @Operation(summary = "Historique des tentatives d'un étudiant pour un quiz")
    public ApiResponse<List<AttemptResponse>> getAttempts(
            @PathVariable Long id, @PathVariable Long studentId) {
        return ApiResponse.success("Tentatives récupérées", assignmentService.getAttemptsByStudent(id, studentId));
    }
}
