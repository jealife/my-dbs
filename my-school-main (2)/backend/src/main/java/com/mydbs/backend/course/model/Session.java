package com.mydbs.backend.course.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "course_sessions",
        indexes = {
                @Index(name = "idx_course_sessions_course", columnList = "course_id"),
                @Index(name = "idx_course_sessions_lesson", columnList = "lesson_id"),
                @Index(name = "idx_course_sessions_start_end", columnList = "start_at,end_at")
        })
public class Session extends BaseAuditEntity {

    @Column(name = "title", nullable = false, length = 180)
    private String title;

    @Column(name = "description", length = 3000)
    private String description;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Column(name = "timezone", nullable = false, length = 80)
    private String timezone;

    @Column(name = "meeting_link", length = 500)
    private String meetingLink;

    @Column(name = "recording_link", length = 500)
    private String recordingLink;

    @Column(name = "location_label", length = 200)
    private String locationLabel;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode", nullable = false, length = 30)
    private SessionMode mode = SessionMode.ONSITE;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private SessionStatus status = SessionStatus.PLANNED;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_course_session_course"))
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id",
            foreignKey = @ForeignKey(name = "fk_course_session_lesson"))
    private Lesson lesson;

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getStartAt() {
        return startAt;
    }

    public LocalDateTime getEndAt() {
        return endAt;
    }

    public String getTimezone() {
        return timezone;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public String getRecordingLink() {
        return recordingLink;
    }

    public String getLocationLabel() {
        return locationLabel;
    }

    public SessionMode getMode() {
        return mode;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public Course getCourse() {
        return course;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setStartAt(LocalDateTime startAt) {
        this.startAt = startAt;
    }

    public void setEndAt(LocalDateTime endAt) {
        this.endAt = endAt;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public void setRecordingLink(String recordingLink) {
        this.recordingLink = recordingLink;
    }

    public void setLocationLabel(String locationLabel) {
        this.locationLabel = locationLabel;
    }

    public void setMode(SessionMode mode) {
        this.mode = mode;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public void setLesson(Lesson lesson) {
        this.lesson = lesson;
    }
}