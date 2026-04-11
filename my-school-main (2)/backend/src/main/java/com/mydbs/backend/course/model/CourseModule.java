package com.mydbs.backend.course.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "course_modules",
        indexes = {
                @Index(name = "idx_course_modules_course", columnList = "course_id"),
                @Index(name = "idx_course_modules_order", columnList = "display_order")
        })
public class CourseModule extends BaseAuditEntity {

    @Column(name = "title", nullable = false, length = 180)
    private String title;

    @Column(name = "description", length = 3000)
    private String description;

    @Column(name = "objectives", length = 3000)
    private String objectives;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "estimated_minutes")
    private Integer estimatedMinutes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_course_module_course"))
    private Course course;

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getObjectives() {
        return objectives;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public Integer getEstimatedMinutes() {
        return estimatedMinutes;
    }

    public Course getCourse() {
        return course;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setObjectives(String objectives) {
        this.objectives = objectives;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public void setEstimatedMinutes(Integer estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
    }

    public void setCourse(Course course) {
        this.course = course;
    }
}