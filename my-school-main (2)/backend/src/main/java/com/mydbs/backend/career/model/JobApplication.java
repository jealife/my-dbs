package com.mydbs.backend.career.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

/** JobApplication = candidature d'un étudiant à une offre. */
@Entity
@Table(name = "job_applications",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_application_student_offer",
                        columnNames = {"student_id", "job_offer_id"})
        },
        indexes = {
                @Index(name = "idx_app_student", columnList = "student_id"),
                @Index(name = "idx_app_offer", columnList = "job_offer_id"),
                @Index(name = "idx_app_status", columnList = "status")
        })
public class JobApplication extends BaseAuditEntity {

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "job_offer_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_app_offer"))
    private JobOffer jobOffer;

    /** SUBMITTED | UNDER_REVIEW | INTERVIEW | ACCEPTED | REJECTED | WITHDRAWN */
    @Column(name = "status", nullable = false, length = 20)
    private String status = "SUBMITTED";

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "cv_file_path", length = 500)
    private String cvFilePath;

    @Column(name = "applied_at")
    private LocalDate appliedAt;

    @Column(name = "recruiter_notes", length = 1000)
    private String recruiterNotes;

    // Getters & Setters
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public JobOffer getJobOffer() { return jobOffer; }
    public void setJobOffer(JobOffer jobOffer) { this.jobOffer = jobOffer; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    public String getCvFilePath() { return cvFilePath; }
    public void setCvFilePath(String cvFilePath) { this.cvFilePath = cvFilePath; }
    public LocalDate getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDate appliedAt) { this.appliedAt = appliedAt; }
    public String getRecruiterNotes() { return recruiterNotes; }
    public void setRecruiterNotes(String recruiterNotes) { this.recruiterNotes = recruiterNotes; }
}
