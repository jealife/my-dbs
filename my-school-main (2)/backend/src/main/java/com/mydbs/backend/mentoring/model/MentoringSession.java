package com.mydbs.backend.mentoring.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

/** MentoringSession = séance individuelle dans une relation de mentorat. */
@Entity
@Table(name = "mentoring_sessions",
        indexes = {
                @Index(name = "idx_msession_mentorship", columnList = "mentorship_id"),
                @Index(name = "idx_msession_date", columnList = "session_date")
        })
public class MentoringSession extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mentorship_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_msession_mentorship"))
    private Mentorship mentorship;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "notes", length = 2000)
    private String notes;

    @Column(name = "status", length = 20)
    private String status = "PLANNED";   // PLANNED | DONE | CANCELLED

    // Getters & Setters
    public Mentorship getMentorship() { return mentorship; }
    public void setMentorship(Mentorship mentorship) { this.mentorship = mentorship; }
    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
