package com.mydbs.backend.assignment.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/**
 * Réponse d'un étudiant à une question de quiz.
 * Stockée en tant que collection embarquée dans Attempt (table quiz_answers).
 */
@Embeddable
public class QuizAnswer {

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    /**
     * Pour SINGLE/MULTIPLE_CHOICE : IDs des choix sélectionnés (séparés par une virgule)
     * Pour TRUE_FALSE : "true" ou "false"
     * Pour SHORT_ANSWER / ESSAY : texte de la réponse
     */
    @Column(name = "answer_value", length = 2000)
    private String answerValue;

    @Column(name = "is_correct")
    private Boolean correct;

    @Column(name = "points_earned")
    private Double pointsEarned;

    public QuizAnswer() {}

    public QuizAnswer(Long questionId, String answerValue) {
        this.questionId = questionId;
        this.answerValue = answerValue;
    }

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public String getAnswerValue() { return answerValue; }
    public void setAnswerValue(String answerValue) { this.answerValue = answerValue; }
    public Boolean getCorrect() { return correct; }
    public void setCorrect(Boolean correct) { this.correct = correct; }
    public Double getPointsEarned() { return pointsEarned; }
    public void setPointsEarned(Double pointsEarned) { this.pointsEarned = pointsEarned; }
}
