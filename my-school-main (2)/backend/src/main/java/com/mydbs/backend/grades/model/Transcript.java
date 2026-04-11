package com.mydbs.backend.grades.model;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.student.model.Student;
import jakarta.persistence.*;

/**
 * Transcript = relevé de notes officiel toutes années confondues.
 * Document récapitulatif du parcours académique complet de l'étudiant.
 */
@Entity
@Table(name = "transcripts",
        indexes = {
                @Index(name = "idx_transcript_student", columnList = "student_id")
        })
public class Transcript extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_transcript_student"))
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id",
            foreignKey = @ForeignKey(name = "fk_transcript_year"))
    private AcademicYear academicYear;

    @Column(name = "reference_number", nullable = false, unique = true, length = 50)
    private String referenceNumber;

    @Column(name = "general_average")
    private Double generalAverage;

    @Column(name = "total_credits_acquired")
    private Integer totalCreditsAcquired;

    @Column(name = "total_credits_possible")
    private Integer totalCreditsPossible;

    @Column(name = "issued_at", nullable = false)
    private java.time.LocalDate issuedAt;

    @Column(name = "file_path", length = 1000)
    private String filePath;

    @Column(name = "type", length = 30)
    private String type = "ANNUAL";   // ANNUAL | SEMESTER | FINAL

    // Getters & Setters
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public Double getGeneralAverage() { return generalAverage; }
    public void setGeneralAverage(Double generalAverage) { this.generalAverage = generalAverage; }
    public Integer getTotalCreditsAcquired() { return totalCreditsAcquired; }
    public void setTotalCreditsAcquired(Integer totalCreditsAcquired) { this.totalCreditsAcquired = totalCreditsAcquired; }
    public Integer getTotalCreditsPossible() { return totalCreditsPossible; }
    public void setTotalCreditsPossible(Integer totalCreditsPossible) { this.totalCreditsPossible = totalCreditsPossible; }
    public java.time.LocalDate getIssuedAt() { return issuedAt; }
    public void setIssuedAt(java.time.LocalDate issuedAt) { this.issuedAt = issuedAt; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
