package com.mydbs.backend.grades.model;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.Cohort;
import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.course.model.Course;
import com.mydbs.backend.student.model.Student;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/**
 * GradeBook = carnet de notes d'un étudiant pour un cours et une année académique.
 * Aggrège tous les GradeItems (évaluations, devoirs, quiz) et calcule la moyenne pondérée.
 */
@Entity
@Table(name = "grade_books",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_gradebook_student_course_year",
                        columnNames = {"student_id", "course_id", "academic_year_id"})
        },
        indexes = {
                @Index(name = "idx_gradebook_student", columnList = "student_id"),
                @Index(name = "idx_gradebook_course", columnList = "course_id"),
                @Index(name = "idx_gradebook_year", columnList = "academic_year_id")
        })
public class GradeBook extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_gradebook_student"))
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_gradebook_course"))
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_gradebook_year"))
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cohort_id",
            foreignKey = @ForeignKey(name = "fk_gradebook_cohort"))
    private Cohort cohort;

    @Column(name = "semester", length = 20)
    private String semester;

    /** Moyenne pondérée calculée (stockée pour performance) */
    @Column(name = "weighted_average")
    private Double weightedAverage;

    /** Crédits ECTS du cours */
    @Column(name = "credits")
    private Integer credits;

    /** Coefficient du cours dans le bulletin */
    @Column(name = "coefficient")
    private Double coefficient = 1.0;

    /** Cours validé (note >= seuil) */
    @Column(name = "validated", nullable = false)
    private boolean validated = false;

    @Column(name = "passing_grade")
    private Double passingGrade = 10.0;

    @Column(name = "teacher_appreciation", length = 1000)
    private String teacherAppreciation;

    // Getters & Setters
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }
    public Cohort getCohort() { return cohort; }
    public void setCohort(Cohort cohort) { this.cohort = cohort; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public Double getWeightedAverage() { return weightedAverage; }
    public void setWeightedAverage(Double weightedAverage) { this.weightedAverage = weightedAverage; }
    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }
    public Double getCoefficient() { return coefficient; }
    public void setCoefficient(Double coefficient) { this.coefficient = coefficient; }
    public boolean isValidated() { return validated; }
    public void setValidated(boolean validated) { this.validated = validated; }
    public Double getPassingGrade() { return passingGrade; }
    public void setPassingGrade(Double passingGrade) { this.passingGrade = passingGrade; }
    public String getTeacherAppreciation() { return teacherAppreciation; }
    public void setTeacherAppreciation(String teacherAppreciation) { this.teacherAppreciation = teacherAppreciation; }
}
