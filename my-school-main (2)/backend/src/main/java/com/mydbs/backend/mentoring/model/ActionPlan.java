package com.mydbs.backend.mentoring.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

/** ActionPlan = plan d'action fixé pendant une relation de mentorat. */
@Entity
@Table(name = "action_plans",
        indexes = {
                @Index(name = "idx_plan_mentorship", columnList = "mentorship_id")
        })
public class ActionPlan extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mentorship_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_plan_mentorship"))
    private Mentorship mentorship;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "completed", nullable = false)
    private boolean completed = false;

    @Column(name = "completed_at")
    private LocalDate completedAt;

    // Getters & Setters
    public Mentorship getMentorship() { return mentorship; }
    public void setMentorship(Mentorship mentorship) { this.mentorship = mentorship; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public LocalDate getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDate completedAt) { this.completedAt = completedAt; }
}
