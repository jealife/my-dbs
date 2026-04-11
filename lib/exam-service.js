/**
 * Exam service — MyDBS
 *
 * Le backend n'a pas de contrôleur /exams distinct.
 * Les examens sont gérés via :
 *   - Évaluations  : /api/v1/evaluations  (M02)
 *   - Devoirs/Quiz : /api/v1/assignments   (M03)
 *
 * Ce service est un alias ciblé sur les cas d'usage "examen"
 * (type=EXAM, publication des résultats, délibérations).
 */
import { apiClient } from '@/lib/api-client'
import { extractList, extractItem } from './api-helpers'

export const examService = {
  // ── Évaluations (examens) ──────────────────────────────────────────────────

  /**
   * Lister les évaluations — filtre optionnel par status, courseId, cohortId
   */
  async getAll(params = {}) {
    const res = await apiClient.get('/v1/evaluations', { params })
    return extractList(res.data)
  },

  /**
   * Détail d'une évaluation
   */
  async getById(id) {
    const res = await apiClient.get(`/v1/evaluations/${id}`)
    return extractItem(res.data)
  },

  /**
   * Créer une évaluation (ADMIN, PEDAGOGICAL_MANAGER, TEACHER)
   */
  async create(data) {
    const res = await apiClient.post('/v1/evaluations', data)
    return extractItem(res.data)
  },

  /**
   * Modifier une évaluation (statut DRAFT ou SCHEDULED uniquement)
   */
  async update(id, data) {
    const res = await apiClient.put(`/v1/evaluations/${id}`, data)
    return extractItem(res.data)
  },

  /**
   * Changer le statut d'une évaluation
   * targetStatus : DRAFT | SCHEDULED | IN_PROGRESS | CLOSED | RESULTS_PUBLISHED
   */
  async updateStatus(id, targetStatus) {
    const res = await apiClient.patch(`/v1/evaluations/${id}/status`, null, {
      params: { targetStatus }
    })
    return extractItem(res.data)
  },

  /**
   * Saisir la note d'un étudiant
   */
  async submitGrade(evaluationId, gradeData) {
    const res = await apiClient.post(`/v1/evaluations/${evaluationId}/grades`, gradeData)
    return extractItem(res.data)
  },

  /**
   * Corriger une note (avant publication)
   */
  async updateGrade(resultId, gradeData) {
    const res = await apiClient.patch(`/v1/evaluations/grades/${resultId}`, gradeData)
    return extractItem(res.data)
  },

  /**
   * Toutes les notes d'une évaluation (enseignant/admin)
   */
  async getGrades(evaluationId) {
    const res = await apiClient.get(`/v1/evaluations/${evaluationId}/grades`)
    return extractList(res.data)
  },

  /**
   * Note d'un étudiant pour une évaluation
   */
  async getStudentGrade(evaluationId, studentId) {
    const res = await apiClient.get(`/v1/evaluations/${evaluationId}/grades/student/${studentId}`)
    return extractItem(res.data)
  },

  /**
   * Tous les résultats publiés d'un étudiant
   */
  async getStudentResults(studentId) {
    const res = await apiClient.get(`/v1/evaluations/my-results/student/${studentId}`)
    return extractList(res.data)
  },

  /**
   * Résultats d'un étudiant pour un cours
   */
  async getStudentResultsByCourse(studentId, courseId) {
    const res = await apiClient.get(`/v1/evaluations/my-results/student/${studentId}/course/${courseId}`)
    return extractList(res.data)
  },

  /**
   * Publier les résultats d'une évaluation
   */
  async publish(evaluationId) {
    const res = await apiClient.post(`/v1/evaluations/${evaluationId}/publish`)
    return extractItem(res.data)
  },

  /**
   * Ajouter un critère à la grille d'évaluation
   */
  async addRubricCriterion(evaluationId, criterionData) {
    const res = await apiClient.post(`/v1/evaluations/${evaluationId}/rubric`, criterionData)
    return extractItem(res.data)
  },

  /**
   * Obtenir la grille d'évaluation
   */
  async getRubric(evaluationId) {
    const res = await apiClient.get(`/v1/evaluations/${evaluationId}/rubric`)
    return extractList(res.data)
  },

  // ── Délibérations ──────────────────────────────────────────────────────────

  /**
   * Créer une session de jury
   */
  async createDeliberation(data) {
    const res = await apiClient.post('/v1/evaluations/deliberations', data)
    return extractItem(res.data)
  },

  /**
   * Lister les délibérations
   */
  async getDeliberations(params = {}) {
    const res = await apiClient.get('/v1/evaluations/deliberations', { params })
    return extractList(res.data)
  },

  /**
   * Détail d'une délibération
   */
  async getDeliberation(id) {
    const res = await apiClient.get(`/v1/evaluations/deliberations/${id}`)
    return extractItem(res.data)
  },

  /**
   * Publier une délibération
   */
  async publishDeliberation(id) {
    const res = await apiClient.post(`/v1/evaluations/deliberations/${id}/publish`)
    return extractItem(res.data)
  },

  // ── Devoirs & Quiz (/api/v1/assignments) ──────────────────────────────────

  /**
   * Lister les devoirs/quiz
   */
  async getAssignments(params = {}) {
    const res = await apiClient.get('/v1/assignments', { params })
    return extractList(res.data)
  },

  /**
   * Détail d'un devoir
   */
  async getAssignment(id) {
    const res = await apiClient.get(`/v1/assignments/${id}`)
    return extractItem(res.data)
  },

  /**
   * Créer un devoir
   */
  async createAssignment(data) {
    const res = await apiClient.post('/v1/assignments', data)
    return extractItem(res.data)
  },

  /**
   * Publier un devoir (visible aux étudiants)
   */
  async publishAssignment(id) {
    const res = await apiClient.patch(`/v1/assignments/${id}/publish`)
    return extractItem(res.data)
  },

  /**
   * Publier les résultats d'un devoir
   */
  async publishAssignmentResults(id) {
    const res = await apiClient.patch(`/v1/assignments/${id}/publish-results`)
    return extractItem(res.data)
  },

  /**
   * Soumettre un devoir (étudiant) — multipart
   */
  async submitAssignment(assignmentId, formData) {
    const res = await apiClient.post(`/v1/assignments/${assignmentId}/submissions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return extractItem(res.data)
  },

  /**
   * Toutes les soumissions d'un devoir (enseignant)
   */
  async getSubmissions(assignmentId) {
    const res = await apiClient.get(`/v1/assignments/${assignmentId}/submissions`)
    return extractList(res.data)
  },

  /**
   * Soumission d'un étudiant spécifique
   */
  async getStudentSubmission(assignmentId, studentId) {
    const res = await apiClient.get(`/v1/assignments/${assignmentId}/submissions/student/${studentId}`)
    return extractItem(res.data)
  },

  /**
   * Corriger une soumission (attribuer note + feedback)
   */
  async gradeSubmission(submissionId, score, feedback = '') {
    const res = await apiClient.patch(`/v1/assignments/submissions/${submissionId}/grade`, null, {
      params: { score, feedback }
    })
    return extractItem(res.data)
  },

  /**
   * Rendre la copie corrigée à l'étudiant
   */
  async returnSubmission(submissionId) {
    const res = await apiClient.patch(`/v1/assignments/submissions/${submissionId}/return`)
    return extractItem(res.data)
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────

  /**
   * Créer/associer un quiz à un devoir
   */
  async createQuiz(assignmentId, params = {}) {
    const res = await apiClient.post(`/v1/assignments/${assignmentId}/quiz`, null, { params })
    return extractItem(res.data)
  },

  /**
   * Ajouter une question au quiz
   */
  async addQuizQuestion(assignmentId, questionData) {
    const res = await apiClient.post(`/v1/assignments/${assignmentId}/quiz/questions`, questionData)
    return extractItem(res.data)
  },

  /**
   * Lister les questions du quiz
   */
  async getQuizQuestions(assignmentId) {
    const res = await apiClient.get(`/v1/assignments/${assignmentId}/quiz/questions`)
    return extractList(res.data)
  },

  /**
   * Démarrer une tentative de quiz (étudiant)
   */
  async startQuiz(assignmentId, studentId) {
    const res = await apiClient.post(`/v1/assignments/${assignmentId}/quiz/start`, null, {
      params: { studentId }
    })
    return extractItem(res.data)
  },

  /**
   * Soumettre les réponses d'une tentative (correction automatique QCM)
   */
  async submitQuizAttempt(attemptId, answers) {
    const res = await apiClient.post(`/v1/assignments/quiz/attempts/${attemptId}/submit`, answers)
    return extractItem(res.data)
  },

  /**
   * Historique des tentatives d'un étudiant
   */
  async getStudentAttempts(assignmentId, studentId) {
    const res = await apiClient.get(`/v1/assignments/${assignmentId}/quiz/attempts/student/${studentId}`)
    return extractList(res.data)
  },
}
