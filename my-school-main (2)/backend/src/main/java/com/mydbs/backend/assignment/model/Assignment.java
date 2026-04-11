package com.mydbs.backend.assignment.model;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.Cohort;
import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.course.model.Course;
import com.mydbs.backend.user.model.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignments",
        indexes = {
                @Index(name = "idx_assignment_course", columnList = "course_id"),
                @Index(name = "idx_assignment_cohort", columnList = "cohort_id"),
                @Index(name = "idx_assignment_year", columnList = "academic_year_id"),
                @Index(name = "idx_assignment_type", columnList = "assignment_type"),
                @Index(name = "idx_assignment_due", columnList = "due_date")
        })
public class Assignment extends BaseAuditEntity {

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", length = 4000)
    private String description;

    @Column(name = "instructions", length = 4000)
    private String instructions;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_type", nullable = false, length = 30)
    private AssignmentType assignmentType;

    @Column(name = "max_score", nullable = false)
    private Double maxScore = 20.0;

    @Column(name = "passing_score")
    private Double passingScore;

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @Column(name = "available_from")
    private LocalDateTime availableFrom;

    @Column(name = "allow_late_submission", nullable = false)
    private boolean allowLateSubmission = false;

    @Column(name = "late_penalty_percent")
    private Double latePenaltyPercent;

    @Column(name = "max_attempts")
    private Integer maxAttempts = 1;

    @Column(name = "published", nullable = false)
    private boolean published = false;

    @Column(name = "results_published", nullable = false)
    private boolean resultsPublished = false;

    @Column(name = "semester", length = 20)
    private String semester;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_assignment_course"))
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_assignment_academic_year"))
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cohort_id",
            foreignKey = @ForeignKey(name = "fk_assignment_cohort"))
    private Cohort cohort;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id",
            foreignKey = @ForeignKey(name = "fk_assignment_creator"))
    private User createdByUser;

    // Getters & Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public AssignmentType getAssignmentType() { return assignmentType; }
    public void setAssignmentType(AssignmentType assignmentType) { this.assignmentType = assignmentType; }
    public Double getMaxScore() { return maxScore; }
    public void setMaxScore(Double maxScore) { this.maxScore = maxScore; }
    public Double getPassingScore() { return passingScore; }
    public void setPassingScore(Double passingScore) { this.passingScore = passingScore; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public LocalDateTime getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDateTime availableFrom) { this.availableFrom = availableFrom; }
    public boolean isAllowLateSubmission() { return allowLateSubmission; }
    public void setAllowLateSubmission(boolean allowLateSubmission) { this.allowLateSubmission = allowLateSubmission; }
    public Double getLatePenaltyPercent() { return latePenaltyPercent; }
    public void setLatePenaltyPercent(Double latePenaltyPercent) { this.latePenaltyPercent = latePenaltyPercent; }
    public Integer getMaxAttempts() { return maxAttempts; }
    public void setMaxAttempts(Integer maxAttempts) { this.maxAttempts = maxAttempts; }
    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }
    public boolean isResultsPublished() { return resultsPublished; }
    public void setResultsPublished(boolean resultsPublished) { this.resultsPublished = resultsPublished; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }
    public Cohort getCohort() { return cohort; }
    public void setCohort(Cohort cohort) { this.cohort = cohort; }
    public User getCreatedByUser() { return createdByUser; }
    public void setCreatedByUser(User createdByUser) { this.createdByUser = createdByUser; }
}
