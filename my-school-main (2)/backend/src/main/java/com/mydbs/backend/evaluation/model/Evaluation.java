package com.mydbs.backend.evaluation.model;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.ClassRoom;
import com.mydbs.backend.academic.model.Cohort;
import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.course.model.Course;
import com.mydbs.backend.user.model.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "evaluations",
        indexes = {
                @Index(name = "idx_eval_status", columnList = "status"),
                @Index(name = "idx_eval_course", columnList = "course_id"),
                @Index(name = "idx_eval_cohort", columnList = "cohort_id"),
                @Index(name = "idx_eval_year", columnList = "academic_year_id"),
                @Index(name = "idx_eval_type", columnList = "evaluation_type")
        })
public class Evaluation extends BaseAuditEntity {

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "evaluation_type", nullable = false, length = 40)
    private EvaluationType evaluationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private EvaluationStatus status = EvaluationStatus.DRAFT;

    @Column(name = "max_score", nullable = false)
    private Double maxScore = 20.0;

    @Column(name = "passing_score", nullable = false)
    private Double passingScore = 10.0;

    @Column(name = "weight_percentage")
    private Double weightPercentage;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "room_info", length = 200)
    private String roomInfo;

    @Column(name = "instructions", length = 3000)
    private String instructions;

    @Column(name = "results_published_at")
    private LocalDateTime resultsPublishedAt;

    @Column(name = "semester", length = 20)
    private String semester;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_eval_course"))
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_eval_academic_year"))
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cohort_id",
            foreignKey = @ForeignKey(name = "fk_eval_cohort"))
    private Cohort cohort;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id",
            foreignKey = @ForeignKey(name = "fk_eval_class"))
    private ClassRoom classRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id",
            foreignKey = @ForeignKey(name = "fk_eval_creator"))
    private User createdByUser;

    // Getters & Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public EvaluationType getEvaluationType() { return evaluationType; }
    public void setEvaluationType(EvaluationType evaluationType) { this.evaluationType = evaluationType; }

    public EvaluationStatus getStatus() { return status; }
    public void setStatus(EvaluationStatus status) { this.status = status; }

    public Double getMaxScore() { return maxScore; }
    public void setMaxScore(Double maxScore) { this.maxScore = maxScore; }

    public Double getPassingScore() { return passingScore; }
    public void setPassingScore(Double passingScore) { this.passingScore = passingScore; }

    public Double getWeightPercentage() { return weightPercentage; }
    public void setWeightPercentage(Double weightPercentage) { this.weightPercentage = weightPercentage; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getRoomInfo() { return roomInfo; }
    public void setRoomInfo(String roomInfo) { this.roomInfo = roomInfo; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public LocalDateTime getResultsPublishedAt() { return resultsPublishedAt; }
    public void setResultsPublishedAt(LocalDateTime resultsPublishedAt) { this.resultsPublishedAt = resultsPublishedAt; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }

    public Cohort getCohort() { return cohort; }
    public void setCohort(Cohort cohort) { this.cohort = cohort; }

    public ClassRoom getClassRoom() { return classRoom; }
    public void setClassRoom(ClassRoom classRoom) { this.classRoom = classRoom; }

    public User getCreatedByUser() { return createdByUser; }
    public void setCreatedByUser(User createdByUser) { this.createdByUser = createdByUser; }
}
