package com.mydbs.backend.attendance.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.course.model.Session;
import com.mydbs.backend.student.model.Student;
import jakarta.persistence.*;

import java.time.LocalTime;

@Entity
@Table(name = "attendance_records",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_attendance_session_student",
                        columnNames = {"session_id", "student_id"})
        },
        indexes = {
                @Index(name = "idx_att_session", columnList = "session_id"),
                @Index(name = "idx_att_student", columnList = "student_id"),
                @Index(name = "idx_att_status", columnList = "status")
        })
public class AttendanceRecord extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_att_session"))
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_att_student"))
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AttendanceStatus status = AttendanceStatus.ABSENT;

    @Column(name = "arrival_time")
    private LocalTime arrivalTime;

    @Column(name = "late_minutes")
    private Integer lateMinutes;

    @Column(name = "teacher_note", length = 500)
    private String teacherNote;

    // Getters & Setters
    public Session getSession() { return session; }
    public void setSession(Session session) { this.session = session; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }
    public LocalTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalTime arrivalTime) { this.arrivalTime = arrivalTime; }
    public Integer getLateMinutes() { return lateMinutes; }
    public void setLateMinutes(Integer lateMinutes) { this.lateMinutes = lateMinutes; }
    public String getTeacherNote() { return teacherNote; }
    public void setTeacherNote(String teacherNote) { this.teacherNote = teacherNote; }
}
