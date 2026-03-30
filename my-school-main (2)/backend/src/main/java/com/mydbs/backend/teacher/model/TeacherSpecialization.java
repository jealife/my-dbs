package com.mydbs.backend.teacher.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "teacher_specializations",
        indexes = {
                @Index(name = "idx_teacher_specialization_teacher", columnList = "teacher_id")
        })
public class TeacherSpecialization extends BaseAuditEntity {

    @Column(name = "label", nullable = false, length = 180)
    private String label;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "primary_specialization", nullable = false)
    private boolean primarySpecialization = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_teacher_specialization_teacher"))
    private Teacher teacher;

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }

    public boolean isPrimarySpecialization() {
        return primarySpecialization;
    }

    public Teacher getTeacher() {
        return teacher;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrimarySpecialization(boolean primarySpecialization) {
        this.primarySpecialization = primarySpecialization;
    }

    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }
}