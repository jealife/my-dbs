package com.mydbs.backend.student.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "student_status_history",
        indexes = {
                @Index(name = "idx_student_status_history_student", columnList = "student_id")
        })
public class StudentStatusHistory extends BaseAuditEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 30)
    private StudentStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 30)
    private StudentStatus newStatus;

    @Column(name = "reason", length = 2000)
    private String reason;

    @Column(name = "context_label", length = 255)
    private String contextLabel;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_student_status_history_student"))
    private Student student;

    public StudentStatus getOldStatus() {
        return oldStatus;
    }

    public StudentStatus getNewStatus() {
        return newStatus;
    }

    public String getReason() {
        return reason;
    }

    public String getContextLabel() {
        return contextLabel;
    }

    public Student getStudent() {
        return student;
    }

    public void setOldStatus(StudentStatus oldStatus) {
        this.oldStatus = oldStatus;
    }

    public void setNewStatus(StudentStatus newStatus) {
        this.newStatus = newStatus;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public void setContextLabel(String contextLabel) {
        this.contextLabel = contextLabel;
    }

    public void setStudent(Student student) {
        this.student = student;
    }
}