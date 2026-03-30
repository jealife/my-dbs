package com.mydbs.backend.competence.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

/** BadgeAward = attribution d'un badge à un étudiant. */
@Entity
@Table(name = "badge_awards",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_award_student_badge",
                        columnNames = {"student_id", "badge_id"})
        },
        indexes = {
                @Index(name = "idx_award_student", columnList = "student_id"),
                @Index(name = "idx_award_badge", columnList = "badge_id")
        })
public class BadgeAward extends BaseAuditEntity {

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "badge_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_award_badge"))
    private Badge badge;

    @Column(name = "awarded_at", nullable = false)
    private LocalDate awardedAt;

    @Column(name = "awarded_by_id")
    private Long awardedById;  // null si auto-attribution

    @Column(name = "award_reason", length = 500)
    private String awardReason;

    // Getters & Setters
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Badge getBadge() { return badge; }
    public void setBadge(Badge badge) { this.badge = badge; }
    public LocalDate getAwardedAt() { return awardedAt; }
    public void setAwardedAt(LocalDate awardedAt) { this.awardedAt = awardedAt; }
    public Long getAwardedById() { return awardedById; }
    public void setAwardedById(Long awardedById) { this.awardedById = awardedById; }
    public String getAwardReason() { return awardReason; }
    public void setAwardReason(String awardReason) { this.awardReason = awardReason; }
}
