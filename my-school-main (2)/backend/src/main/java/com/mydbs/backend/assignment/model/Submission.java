package com.mydbs.backend.assignment.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.student.model.Student;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions",
        indexes = {
                @Index(name = "idx_submission_assignment", columnList = "assignment_id"),
                @Index(name = "idx_submission_student", columnList = "student_id"),
                @Index(name = "idx_submission_status", columnList = "status")
        })
public class Submission extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assignment_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_submission_assignment"))
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_submission_student"))
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SubmissionStatus status = SubmissionStatus.NOT_SUBMITTED;

    @Column(name = "content", length = 8000)
    private String content;

    @Column(name = "file_path", length = 1000)
    private String filePath;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber = 1;

    @Column(name = "is_latest", nullable = false)
    private boolean latest = true;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "is_late", nullable = false)
    private boolean late = false;

    @Column(name = "score")
    private Double score;

    @Column(name = "final_score")
    private Double finalScore;

    @Column(name = "teacher_feedback", length = 3000)
    private String teacherFeedback;

    @Column(name = "graded_at")
    private LocalDateTime gradedAt;

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;

    // Getters & Setters
    public Assignment getAssignment() { return assignment; }
    public void setAssignment(Assignment assignment) { this.assignment = assignment; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public SubmissionStatus getStatus() { return status; }
    public void setStatus(SubmissionStatus status) { this.status = status; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }
    public Integer getVersionNumber() { return versionNumber; }
    public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }
    public boolean isLatest() { return latest; }
    public void setLatest(boolean latest) { this.latest = latest; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public boolean isLate() { return late; }
    public void setLate(boolean late) { this.late = late; }
    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
    public Double getFinalScore() { return finalScore; }
    public void setFinalScore(Double finalScore) { this.finalScore = finalScore; }
    public String getTeacherFeedback() { return teacherFeedback; }
    public void setTeacherFeedback(String teacherFeedback) { this.teacherFeedback = teacherFeedback; }
    public LocalDateTime getGradedAt() { return gradedAt; }
    public void setGradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; }
    public LocalDateTime getReturnedAt() { return returnedAt; }
    public void setReturnedAt(LocalDateTime returnedAt) { this.returnedAt = returnedAt; }
}
