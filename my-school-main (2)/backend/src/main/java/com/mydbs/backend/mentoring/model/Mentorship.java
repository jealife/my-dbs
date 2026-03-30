package com.mydbs.backend.mentoring.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

/**
 * Mentorship = relation de mentorat entre un mentor (enseignant/alumni) et un mentoré (étudiant).
 */
@Entity
@Table(name = "mentorships",
        indexes = {
                @Index(name = "idx_mentorship_mentor", columnList = "mentor_id"),
                @Index(name = "idx_mentorship_mentee", columnList = "mentee_id"),
                @Index(name = "idx_mentorship_status", columnList = "status")
        })
public class Mentorship extends BaseAuditEntity {

    @Column(name = "mentor_id", nullable = false)
    private Long mentorId;

    @Column(name = "mentee_id", nullable = false)
    private Long menteeId;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";   // ACTIVE | COMPLETED | CANCELLED

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "goals", length = 2000)
    private String goals;

    @Column(name = "academic_year_id")
    private Long academicYearId;

    // Getters & Setters
    public Long getMentorId() { return mentorId; }
    public void setMentorId(Long mentorId) { this.mentorId = mentorId; }
    public Long getMenteeId() { return menteeId; }
    public void setMenteeId(Long menteeId) { this.menteeId = menteeId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getGoals() { return goals; }
    public void setGoals(String goals) { this.goals = goals; }
    public Long getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }
}
