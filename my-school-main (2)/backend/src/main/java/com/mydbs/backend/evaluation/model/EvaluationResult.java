package com.mydbs.backend.evaluation.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.student.model.Student;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "evaluation_results",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_eval_result_eval_student",
                        columnNames = {"evaluation_id", "student_id"})
        },
        indexes = {
                @Index(name = "idx_eval_result_evaluation", columnList = "evaluation_id"),
                @Index(name = "idx_eval_result_student", columnList = "student_id"),
                @Index(name = "idx_eval_result_status", columnList = "status")
        })
public class EvaluationResult extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evaluation_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_eval_result_evaluation"))
    private Evaluation evaluation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_eval_result_student"))
    private Student student;

    @Column(name = "score")
    private Double score;

    @Column(name = "max_score", nullable = false)
    private Double maxScore = 20.0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ResultStatus status = ResultStatus.PENDING;

    @Column(name = "teacher_comment", length = 1000)
    private String teacherComment;

    @Column(name = "graded_at")
    private LocalDateTime gradedAt;

    @Column(name = "is_compensated", nullable = false)
    private boolean compensated = false;

    // Getters & Setters
    public Evaluation getEvaluation() { return evaluation; }
    public void setEvaluation(Evaluation evaluation) { this.evaluation = evaluation; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public Double getMaxScore() { return maxScore; }
    public void setMaxScore(Double maxScore) { this.maxScore = maxScore; }

    public ResultStatus getStatus() { return status; }
    public void setStatus(ResultStatus status) { this.status = status; }

    public String getTeacherComment() { return teacherComment; }
    public void setTeacherComment(String teacherComment) { this.teacherComment = teacherComment; }

    public LocalDateTime getGradedAt() { return gradedAt; }
    public void setGradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; }

    public boolean isCompensated() { return compensated; }
    public void setCompensated(boolean compensated) { this.compensated = compensated; }
}
