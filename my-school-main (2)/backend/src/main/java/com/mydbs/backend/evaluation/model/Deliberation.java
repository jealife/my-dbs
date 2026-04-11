package com.mydbs.backend.evaluation.model;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.Cohort;
import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.user.model.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "deliberations",
        indexes = {
                @Index(name = "idx_delib_cohort", columnList = "cohort_id"),
                @Index(name = "idx_delib_year", columnList = "academic_year_id")
        })
public class Deliberation extends BaseAuditEntity {

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "semester", length = 20)
    private String semester;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "notes", length = 3000)
    private String notes;

    @Column(name = "published", nullable = false)
    private boolean published = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cohort_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_delib_cohort"))
    private Cohort cohort;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_delib_academic_year"))
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "president_user_id",
            foreignKey = @ForeignKey(name = "fk_delib_president"))
    private User president;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }

    public Cohort getCohort() { return cohort; }
    public void setCohort(Cohort cohort) { this.cohort = cohort; }

    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }

    public User getPresident() { return president; }
    public void setPresident(User president) { this.president = president; }
}
