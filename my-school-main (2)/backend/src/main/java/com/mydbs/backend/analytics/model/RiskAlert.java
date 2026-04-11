package com.mydbs.backend.analytics.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * RiskAlert = alerte automatique générée quand un étudiant atteint un seuil critique.
 * Déclenche une notification in-app pour le responsable pédagogique.
 */
@Entity
@Table(name = "risk_alerts",
        indexes = {
                @Index(name = "idx_alert_student", columnList = "student_id"),
                @Index(name = "idx_alert_type", columnList = "alert_type"),
                @Index(name = "idx_alert_status", columnList = "status"),
                @Index(name = "idx_alert_year", columnList = "academic_year_id")
        })
public class RiskAlert extends BaseAuditEntity {

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "academic_year_id")
    private Long academicYearId;

    /**
     * Type d'alerte :
     * LOW_ATTENDANCE | LOW_GRADE | HIGH_DROPOUT_RISK | MANY_LATE_SUBMISSIONS | MISSING_PAYMENTS
     */
    @Column(name = "alert_type", nullable = false, length = 40)
    private String alertType;

    /** OPEN | ACKNOWLEDGED | RESOLVED */
    @Column(name = "status", nullable = false, length = 20)
    private String status = "OPEN";

    @Column(name = "threshold_value", nullable = false)
    private Double thresholdValue;   // valeur déclenchante

    @Column(name = "observed_value", nullable = false)
    private Double observedValue;    // valeur constatée

    @Column(name = "message", length = 500)
    private String message;

    @Column(name = "assigned_to_id")
    private Long assignedToId;   // Responsable pédagogique notifié

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    // Getters & Setters
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }
    public String getAlertType() { return alertType; }
    public void setAlertType(String alertType) { this.alertType = alertType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getThresholdValue() { return thresholdValue; }
    public void setThresholdValue(Double thresholdValue) { this.thresholdValue = thresholdValue; }
    public Double getObservedValue() { return observedValue; }
    public void setObservedValue(Double observedValue) { this.observedValue = observedValue; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Long getAssignedToId() { return assignedToId; }
    public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
