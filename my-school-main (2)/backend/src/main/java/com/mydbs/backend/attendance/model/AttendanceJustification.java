package com.mydbs.backend.attendance.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.student.model.Student;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "attendance_justifications",
        indexes = {
                @Index(name = "idx_justif_student", columnList = "student_id"),
                @Index(name = "idx_justif_status", columnList = "status"),
                @Index(name = "idx_justif_dates", columnList = "absence_date_from")
        })
public class AttendanceJustification extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_justif_student"))
    private Student student;

    // Lie optionnellement à un AttendanceRecord précis
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendance_record_id",
            foreignKey = @ForeignKey(name = "fk_justif_record"))
    private AttendanceRecord attendanceRecord;

    @Column(name = "reason", nullable = false, length = 2000)
    private String reason;

    @Column(name = "absence_date_from", nullable = false)
    private LocalDate absenceDateFrom;

    @Column(name = "absence_date_to", nullable = false)
    private LocalDate absenceDateTo;

    @Column(name = "document_path", length = 1000)
    private String documentPath;

    @Column(name = "document_name", length = 255)
    private String documentName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private JustificationStatus status = JustificationStatus.PENDING;

    @Column(name = "reviewer_comment", length = 1000)
    private String reviewerComment;

    // Getters & Setters
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public AttendanceRecord getAttendanceRecord() { return attendanceRecord; }
    public void setAttendanceRecord(AttendanceRecord attendanceRecord) { this.attendanceRecord = attendanceRecord; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDate getAbsenceDateFrom() { return absenceDateFrom; }
    public void setAbsenceDateFrom(LocalDate absenceDateFrom) { this.absenceDateFrom = absenceDateFrom; }
    public LocalDate getAbsenceDateTo() { return absenceDateTo; }
    public void setAbsenceDateTo(LocalDate absenceDateTo) { this.absenceDateTo = absenceDateTo; }
    public String getDocumentPath() { return documentPath; }
    public void setDocumentPath(String documentPath) { this.documentPath = documentPath; }
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public JustificationStatus getStatus() { return status; }
    public void setStatus(JustificationStatus status) { this.status = status; }
    public String getReviewerComment() { return reviewerComment; }
    public void setReviewerComment(String reviewerComment) { this.reviewerComment = reviewerComment; }
}
