package com.mydbs.backend.assignment.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.student.model.Student;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Attempt représente une tentative de quiz par un étudiant.
 * Les réponses aux questions sont stockées dans QuizAnswer.
 */
@Entity
@Table(name = "quiz_attempts",
        indexes = {
                @Index(name = "idx_attempt_quiz", columnList = "quiz_id"),
                @Index(name = "idx_attempt_student", columnList = "student_id")
        })
public class Attempt extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_attempt_quiz"))
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_attempt_student"))
    private Student student;

    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber = 1;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "score")
    private Double score;

    @Column(name = "max_score")
    private Double maxScore;

    @Column(name = "score_percentage")
    private Double scorePercentage;

    @Column(name = "passed")
    private Boolean passed;

    @Column(name = "time_taken_minutes")
    private Integer timeTakenMinutes;

    @Column(name = "is_submitted", nullable = false)
    private boolean submitted = false;

    @ElementCollection
    @CollectionTable(name = "quiz_answers",
            joinColumns = @JoinColumn(name = "attempt_id"),
            indexes = @Index(name = "idx_quiz_answer_attempt", columnList = "attempt_id"))
    private List<QuizAnswer> answers = new ArrayList<>();

    // Getters & Setters
    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public Integer getAttemptNumber() { return attemptNumber; }
    public void setAttemptNumber(Integer attemptNumber) { this.attemptNumber = attemptNumber; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
    public Double getMaxScore() { return maxScore; }
    public void setMaxScore(Double maxScore) { this.maxScore = maxScore; }
    public Double getScorePercentage() { return scorePercentage; }
    public void setScorePercentage(Double scorePercentage) { this.scorePercentage = scorePercentage; }
    public Boolean getPassed() { return passed; }
    public void setPassed(Boolean passed) { this.passed = passed; }
    public Integer getTimeTakenMinutes() { return timeTakenMinutes; }
    public void setTimeTakenMinutes(Integer timeTakenMinutes) { this.timeTakenMinutes = timeTakenMinutes; }
    public boolean isSubmitted() { return submitted; }
    public void setSubmitted(boolean submitted) { this.submitted = submitted; }
    public List<QuizAnswer> getAnswers() { return answers; }
    public void setAnswers(List<QuizAnswer> answers) { this.answers = answers; }
}
