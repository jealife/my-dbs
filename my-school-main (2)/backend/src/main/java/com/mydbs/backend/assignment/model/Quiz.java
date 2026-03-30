package com.mydbs.backend.assignment.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Un Quiz est un type spécial d'Assignment avec des questions auto-corrigées.
 * Il est lié à un Assignment (relation 1-1 optionnelle).
 */
@Entity
@Table(name = "quizzes",
        indexes = {
                @Index(name = "idx_quiz_assignment", columnList = "assignment_id")
        })
public class Quiz extends BaseAuditEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assignment_id", nullable = false, unique = true,
            foreignKey = @ForeignKey(name = "fk_quiz_assignment"))
    private Assignment assignment;

    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;

    @Column(name = "randomize_questions", nullable = false)
    private boolean randomizeQuestions = false;

    @Column(name = "randomize_choices", nullable = false)
    private boolean randomizeChoices = false;

    @Column(name = "show_correct_answers", nullable = false)
    private boolean showCorrectAnswers = false;

    @Column(name = "show_after_submission", nullable = false)
    private boolean showAfterSubmission = true;

    @Column(name = "passing_percentage")
    private Double passingPercentage = 50.0;

    @Column(name = "available_from")
    private LocalDateTime availableFrom;

    @Column(name = "available_until")
    private LocalDateTime availableUntil;

    // Getters & Setters
    public Assignment getAssignment() { return assignment; }
    public void setAssignment(Assignment assignment) { this.assignment = assignment; }
    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public void setTimeLimitMinutes(Integer timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }
    public boolean isRandomizeQuestions() { return randomizeQuestions; }
    public void setRandomizeQuestions(boolean randomizeQuestions) { this.randomizeQuestions = randomizeQuestions; }
    public boolean isRandomizeChoices() { return randomizeChoices; }
    public void setRandomizeChoices(boolean randomizeChoices) { this.randomizeChoices = randomizeChoices; }
    public boolean isShowCorrectAnswers() { return showCorrectAnswers; }
    public void setShowCorrectAnswers(boolean showCorrectAnswers) { this.showCorrectAnswers = showCorrectAnswers; }
    public boolean isShowAfterSubmission() { return showAfterSubmission; }
    public void setShowAfterSubmission(boolean showAfterSubmission) { this.showAfterSubmission = showAfterSubmission; }
    public Double getPassingPercentage() { return passingPercentage; }
    public void setPassingPercentage(Double passingPercentage) { this.passingPercentage = passingPercentage; }
    public LocalDateTime getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDateTime availableFrom) { this.availableFrom = availableFrom; }
    public LocalDateTime getAvailableUntil() { return availableUntil; }
    public void setAvailableUntil(LocalDateTime availableUntil) { this.availableUntil = availableUntil; }
}
