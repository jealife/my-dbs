package com.mydbs.backend.planning.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * ScheduleEvent = événement cross-module de l'agenda de la plateforme.
 * Peut représenter un cours, un examen, une deadline, une séance de mentorat,
 * un congé ou tout autre événement académique.
 */
@Entity
@Table(name = "schedule_events",
        indexes = {
                @Index(name = "idx_event_user", columnList = "user_id"),
                @Index(name = "idx_event_cohort", columnList = "cohort_id"),
                @Index(name = "idx_event_teacher", columnList = "teacher_id"),
                @Index(name = "idx_event_start", columnList = "start_at"),
                @Index(name = "idx_event_type", columnList = "event_type")
        })
public class ScheduleEvent extends BaseAuditEntity {

    /**
     * Type d'événement :
     * COURSE_SESSION | EXAM | DEADLINE | MENTOR_SESSION | HOLIDAY | MEETING | OTHER
     */
    @Column(name = "event_type", nullable = false, length = 30)
    private String eventType;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Column(name = "all_day", nullable = false)
    private boolean allDay = false;

    @Column(name = "location", length = 300)
    private String location;

    @Column(name = "meeting_link", length = 500)
    private String meetingLink;

    /** Règle de récurrence (format RFC 5545 RRULE, ex: FREQ=WEEKLY;BYDAY=MO,WE) */
    @Column(name = "recurrence_rule", length = 300)
    private String recurrenceRule;

    /** ID de l'utilisateur propriétaire (étudiant ou enseignant) */
    @Column(name = "user_id")
    private Long userId;

    /** ID de la cohorte — si l'événement concerne toute une classe */
    @Column(name = "cohort_id")
    private Long cohortId;

    /** ID de l'enseignant responsable */
    @Column(name = "teacher_id")
    private Long teacherId;

    /** Référence vers l'entité source (ex: session ID, evaluation ID) */
    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    /** Statut : ACTIVE | CANCELLED | RESCHEDULED */
    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    // Getters & Setters
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getStartAt() { return startAt; }
    public void setStartAt(LocalDateTime startAt) { this.startAt = startAt; }
    public LocalDateTime getEndAt() { return endAt; }
    public void setEndAt(LocalDateTime endAt) { this.endAt = endAt; }
    public boolean isAllDay() { return allDay; }
    public void setAllDay(boolean allDay) { this.allDay = allDay; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    public String getRecurrenceRule() { return recurrenceRule; }
    public void setRecurrenceRule(String recurrenceRule) { this.recurrenceRule = recurrenceRule; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getCohortId() { return cohortId; }
    public void setCohortId(Long cohortId) { this.cohortId = cohortId; }
    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }
    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
}
