package com.mydbs.backend.grades.model;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.Cohort;
import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.student.model.Student;
import jakarta.persistence.*;

/**
 * Bulletin = bulletin semestriel ou annuel d'un étudiant.
 * Agrège les GradeBooks de tous ses cours pour le semestre/année concerné.
 */
@Entity
@Table(name = "bulletins",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_bulletin_student_semester_year",
                        columnNames = {"student_id", "semester", "academic_year_id"})
        },
        indexes = {
                @Index(name = "idx_bulletin_student", columnList = "student_id"),
                @Index(name = "idx_bulletin_year", columnList = "academic_year_id"),
                @Index(name = "idx_bulletin_cohort", columnList = "cohort_id"),
                @Index(name = "idx_bulletin_status", columnList = "status")
        })
public class Bulletin extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_bulletin_student"))
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_bulletin_year"))
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cohort_id",
            foreignKey = @ForeignKey(name = "fk_bulletin_cohort"))
    private Cohort cohort;

    @Column(name = "semester", nullable = false, length = 20)
    private String semester;  // "S1", "S2", "ANNUAL"

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private BulletinStatus status = BulletinStatus.DRAFT;

    /** Moyenne générale pondérée sur tous les cours */
    @Column(name = "general_average")
    private Double generalAverage;

    /** Total crédits ECTS acquis */
    @Column(name = "total_credits_acquired")
    private Integer totalCreditsAcquired;

    /** Total crédits ECTS possibles */
    @Column(name = "total_credits_possible")
    private Integer totalCreditsPossible;

    /** Rang dans la cohorte */
    @Column(name = "rank_in_cohort")
    private Integer rankInCohort;

    @Column(name = "total_students_in_cohort")
    private Integer totalStudentsInCohort;

    @Column(name = "class_average")
    private Double classAverage;

    @Column(name = "highest_average")
    private Double highestAverage;

    @Column(name = "lowest_average")
    private Double lowestAverage;

    @Column(name = "head_teacher_comment", length = 1000)
    private String headTeacherComment;

    @Column(name = "council_decision", length = 500)
    private String councilDecision;

    @Column(name = "published_at")
    private java.time.LocalDateTime publishedAt;

    // Getters & Setters
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }
    public Cohort getCohort() { return cohort; }
    public void setCohort(Cohort cohort) { this.cohort = cohort; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public BulletinStatus getStatus() { return status; }
    public void setStatus(BulletinStatus status) { this.status = status; }
    public Double getGeneralAverage() { return generalAverage; }
    public void setGeneralAverage(Double generalAverage) { this.generalAverage = generalAverage; }
    public Integer getTotalCreditsAcquired() { return totalCreditsAcquired; }
    public void setTotalCreditsAcquired(Integer totalCreditsAcquired) { this.totalCreditsAcquired = totalCreditsAcquired; }
    public Integer getTotalCreditsPossible() { return totalCreditsPossible; }
    public void setTotalCreditsPossible(Integer totalCreditsPossible) { this.totalCreditsPossible = totalCreditsPossible; }
    public Integer getRankInCohort() { return rankInCohort; }
    public void setRankInCohort(Integer rankInCohort) { this.rankInCohort = rankInCohort; }
    public Integer getTotalStudentsInCohort() { return totalStudentsInCohort; }
    public void setTotalStudentsInCohort(Integer totalStudentsInCohort) { this.totalStudentsInCohort = totalStudentsInCohort; }
    public Double getClassAverage() { return classAverage; }
    public void setClassAverage(Double classAverage) { this.classAverage = classAverage; }
    public Double getHighestAverage() { return highestAverage; }
    public void setHighestAverage(Double highestAverage) { this.highestAverage = highestAverage; }
    public Double getLowestAverage() { return lowestAverage; }
    public void setLowestAverage(Double lowestAverage) { this.lowestAverage = lowestAverage; }
    public String getHeadTeacherComment() { return headTeacherComment; }
    public void setHeadTeacherComment(String headTeacherComment) { this.headTeacherComment = headTeacherComment; }
    public String getCouncilDecision() { return councilDecision; }
    public void setCouncilDecision(String councilDecision) { this.councilDecision = councilDecision; }
    public java.time.LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(java.time.LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
}
