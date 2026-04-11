package com.mydbs.backend.teacher.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "teacher_status_history",
        indexes = {
                @Index(name = "idx_teacher_status_history_teacher", columnList = "teacher_id")
        })
public class TeacherStatusHistory extends BaseAuditEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 30)
    private TeacherStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 30)
    private TeacherStatus newStatus;

    @Column(name = "reason", length = 2000)
    private String reason;

    @Column(name = "context_label", length = 255)
    private String contextLabel;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_teacher_status_history_teacher"))
    private Teacher teacher;

    public TeacherStatus getOldStatus() {
        return oldStatus;
    }

    public TeacherStatus getNewStatus() {
        return newStatus;
    }

    public String getReason() {
        return reason;
    }

    public String getContextLabel() {
        return contextLabel;
    }

    public Teacher getTeacher() {
        return teacher;
    }

    public void setOldStatus(TeacherStatus oldStatus) {
        this.oldStatus = oldStatus;
    }

    public void setNewStatus(TeacherStatus newStatus) {
        this.newStatus = newStatus;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public void setContextLabel(String contextLabel) {
        this.contextLabel = contextLabel;
    }

    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }
}