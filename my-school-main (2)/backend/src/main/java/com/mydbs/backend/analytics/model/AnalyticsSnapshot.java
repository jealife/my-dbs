package com.mydbs.backend.analytics.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;

/**
 * AnalyticsSnapshot = instantané périodique d'indicateurs académiques pour un étudiant
 * ou une cohorte. Calculé par batch ou à la demande.
 */
@Entity
@Table(name = "analytics_snapshots",
        indexes = {
                @Index(name = "idx_snapshot_student", columnList = "student_id"),
                @Index(name = "idx_snapshot_cohort", columnList = "cohort_id"),
                @Index(name = "idx_snapshot_year", columnList = "academic_year_id"),
                @Index(name = "idx_snapshot_scope", columnList = "scope")
        })
public class AnalyticsSnapshot extends BaseAuditEntity {

    /** STUDENT | COHORT | PROGRAM | INSTITUTION */
    @Column(name = "scope", nullable = false, length = 20)
    private String scope;

    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "cohort_id")
    private Long cohortId;

    @Column(name = "program_id")
    private Long programId;

    @Column(name = "academic_year_id")
    private Long academicYearId;

    // ── KPIs ──────────────────────────────────────────────────────────────

    /** Taux de complétion des devoirs/quiz (%) */
    @Column(name = "assignment_completion_rate", precision = 5, scale = 2)
    private BigDecimal assignmentCompletionRate;

    /** Taux d'assiduité moyen (%) */
    @Column(name = "attendance_rate", precision = 5, scale = 2)
    private BigDecimal attendanceRate;

    /** Moyenne générale des notes (sur 20) */
    @Column(name = "average_grade", precision = 5, scale = 2)
    private BigDecimal averageGrade;

    /** Crédits ECTS validés */
    @Column(name = "ects_earned")
    private Integer ectsEarned;

    /** Nombre de devoirs rendus en retard */
    @Column(name = "late_submissions_count")
    private Integer lateSubmissionsCount;

    /** Nombre d'absences non justifiées */
    @Column(name = "unjustified_absences_count")
    private Integer unjustifiedAbsencesCount;

    /** Score de risque de décrochage (0-100, calculé) */
    @Column(name = "dropout_risk_score", precision = 5, scale = 2)
    private BigDecimal dropoutRiskScore;

    /** Rang dans la cohorte */
    @Column(name = "cohort_rank")
    private Integer cohortRank;

    // Getters & Setters
    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getCohortId() { return cohortId; }
    public void setCohortId(Long cohortId) { this.cohortId = cohortId; }
    public Long getProgramId() { return programId; }
    public void setProgramId(Long programId) { this.programId = programId; }
    public Long getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }
    public BigDecimal getAssignmentCompletionRate() { return assignmentCompletionRate; }
    public void setAssignmentCompletionRate(BigDecimal assignmentCompletionRate) { this.assignmentCompletionRate = assignmentCompletionRate; }
    public BigDecimal getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(BigDecimal attendanceRate) { this.attendanceRate = attendanceRate; }
    public BigDecimal getAverageGrade() { return averageGrade; }
    public void setAverageGrade(BigDecimal averageGrade) { this.averageGrade = averageGrade; }
    public Integer getEctsEarned() { return ectsEarned; }
    public void setEctsEarned(Integer ectsEarned) { this.ectsEarned = ectsEarned; }
    public Integer getLateSubmissionsCount() { return lateSubmissionsCount; }
    public void setLateSubmissionsCount(Integer lateSubmissionsCount) { this.lateSubmissionsCount = lateSubmissionsCount; }
    public Integer getUnjustifiedAbsencesCount() { return unjustifiedAbsencesCount; }
    public void setUnjustifiedAbsencesCount(Integer unjustifiedAbsencesCount) { this.unjustifiedAbsencesCount = unjustifiedAbsencesCount; }
    public BigDecimal getDropoutRiskScore() { return dropoutRiskScore; }
    public void setDropoutRiskScore(BigDecimal dropoutRiskScore) { this.dropoutRiskScore = dropoutRiskScore; }
    public Integer getCohortRank() { return cohortRank; }
    public void setCohortRank(Integer cohortRank) { this.cohortRank = cohortRank; }
}
