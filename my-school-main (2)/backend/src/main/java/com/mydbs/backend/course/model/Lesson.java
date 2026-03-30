package com.mydbs.backend.course.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "lessons",
        indexes = {
                @Index(name = "idx_lessons_module", columnList = "course_module_id"),
                @Index(name = "idx_lessons_order", columnList = "display_order")
        })
public class Lesson extends BaseAuditEntity {

    @Column(name = "title", nullable = false, length = 180)
    private String title;

    @Column(name = "summary", length = 2000)
    private String summary;

    @Lob
    @Column(name = "content", columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "estimated_minutes")
    private Integer estimatedMinutes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_module_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_lesson_course_module"))
    private CourseModule courseModule;

    public String getTitle() {
        return title;
    }

    public String getSummary() {
        return summary;
    }

    public String getContent() {
        return content;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public Integer getEstimatedMinutes() {
        return estimatedMinutes;
    }

    public CourseModule getCourseModule() {
        return courseModule;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public void setEstimatedMinutes(Integer estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
    }

    public void setCourseModule(CourseModule courseModule) {
        this.courseModule = courseModule;
    }
}