package com.mydbs.backend.grades.model;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.course.model.Course;
import com.mydbs.backend.student.model.Student;
import jakarta.persistence.*;

/**
 * CreditAcquisition = enregistrement formel de l'acquisition de crédits ECTS
 * pour un cours validé par un étudiant.
 */
@Entity
@Table(name = "credit_acquisitions",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_credit_student_course_year",
                        columnNames = {"student_id", "course_id", "academic_year_id"})
        },
        indexes = {
                @Index(name = "idx_credit_student", columnList = "student_id"),
                @Index(name = "idx_credit_course", columnList = "course_id"),
                @Index(name = "idx_credit_year", columnList = "academic_year_id")
        })
public class CreditAcquisition extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_credit_student"))
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_credit_course"))
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_credit_year"))
    private AcademicYear academicYear;

    @Column(name = "credits_earned", nullable = false)
    private Integer creditsEarned;

    @Column(name = "grade_obtained")
    private Double gradeObtained;

    @Column(name = "semester", length = 20)
    private String semester;

    @Column(name = "compensated", nullable = false)
    private boolean compensated = false;  // Compensé par d'autres matières

    // Getters & Setters
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }
    public Integer getCreditsEarned() { return creditsEarned; }
    public void setCreditsEarned(Integer creditsEarned) { this.creditsEarned = creditsEarned; }
    public Double getGradeObtained() { return gradeObtained; }
    public void setGradeObtained(Double gradeObtained) { this.gradeObtained = gradeObtained; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public boolean isCompensated() { return compensated; }
    public void setCompensated(boolean compensated) { this.compensated = compensated; }
}
