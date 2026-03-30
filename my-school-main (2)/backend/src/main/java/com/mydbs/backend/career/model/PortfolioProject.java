package com.mydbs.backend.career.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

/** PortfolioProject = projet ajouté au portfolio étudiant (vitrine). */
@Entity
@Table(name = "portfolio_projects",
        indexes = {
                @Index(name = "idx_portfolio_student", columnList = "student_id"),
                @Index(name = "idx_portfolio_visible", columnList = "publicly_visible")
        })
public class PortfolioProject extends BaseAuditEntity {

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "project_url", length = 500)
    private String projectUrl;

    @Column(name = "repository_url", length = 500)
    private String repositoryUrl;

    @Column(name = "technologies", length = 500)
    private String technologies;  // CSV : "Java, Spring Boot, Angular"

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "publicly_visible", nullable = false)
    private boolean publiclyVisible = false;

    @Column(name = "course_id")
    private Long courseId;   // Si lié à un cours

    // Getters & Setters
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getProjectUrl() { return projectUrl; }
    public void setProjectUrl(String projectUrl) { this.projectUrl = projectUrl; }
    public String getRepositoryUrl() { return repositoryUrl; }
    public void setRepositoryUrl(String repositoryUrl) { this.repositoryUrl = repositoryUrl; }
    public String getTechnologies() { return technologies; }
    public void setTechnologies(String technologies) { this.technologies = technologies; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public boolean isPubliclyVisible() { return publiclyVisible; }
    public void setPubliclyVisible(boolean publiclyVisible) { this.publiclyVisible = publiclyVisible; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
}
