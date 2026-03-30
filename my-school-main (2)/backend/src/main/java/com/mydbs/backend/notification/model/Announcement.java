package com.mydbs.backend.notification.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Announcement = annonce diffusée à un groupe d'utilisateurs ou à toute la plateforme.
 * Tableau d'affichage numérique / fil d'actualités.
 */
@Entity
@Table(name = "announcements",
        indexes = {
                @Index(name = "idx_announcement_published", columnList = "published_at"),
                @Index(name = "idx_announcement_audience", columnList = "audience"),
                @Index(name = "idx_announcement_academic_year", columnList = "academic_year_id")
        })
public class Announcement extends BaseAuditEntity {

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    /** Audience : ALL | STUDENTS | TEACHERS | ADMIN | COHORT */
    @Column(name = "audience", nullable = false, length = 30)
    private String audience = "ALL";

    /** ID de la cohorte si audience = COHORT */
    @Column(name = "cohort_id")
    private Long cohortId;

    @Column(name = "academic_year_id")
    private Long academicYearId;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "pinned", nullable = false)
    private boolean pinned = false;

    @Column(name = "author_id")
    private Long authorId;

    // Getters & Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getAudience() { return audience; }
    public void setAudience(String audience) { this.audience = audience; }
    public Long getCohortId() { return cohortId; }
    public void setCohortId(Long cohortId) { this.cohortId = cohortId; }
    public Long getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public boolean isPinned() { return pinned; }
    public void setPinned(boolean pinned) { this.pinned = pinned; }
    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
}
