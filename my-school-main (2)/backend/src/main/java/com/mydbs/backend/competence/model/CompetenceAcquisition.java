package com.mydbs.backend.competence.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

/** CompetenceAcquisition = acquisition d'une compétence par un étudiant. */
@Entity
@Table(name = "competence_acquisitions",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_acquisition_student_competence",
                        columnNames = {"student_id", "competence_id"})
        },
        indexes = {
                @Index(name = "idx_acquisition_student", columnList = "student_id"),
                @Index(name = "idx_acquisition_competence", columnList = "competence_id")
        })
public class CompetenceAcquisition extends BaseAuditEntity {

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "competence_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_acquisition_competence"))
    private Competence competence;

    /** Niveau acquis : BEGINNER | INTERMEDIATE | ADVANCED | EXPERT */
    @Column(name = "acquired_level", nullable = false, length = 20)
    private String acquiredLevel;

    @Column(name = "validated_by_id")
    private Long validatedById;   // ID de l'enseignant validateur

    @Column(name = "validated_at")
    private LocalDate validatedAt;

    @Column(name = "evidence_description", length = 1000)
    private String evidenceDescription;

    // Getters & Setters
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Competence getCompetence() { return competence; }
    public void setCompetence(Competence competence) { this.competence = competence; }
    public String getAcquiredLevel() { return acquiredLevel; }
    public void setAcquiredLevel(String acquiredLevel) { this.acquiredLevel = acquiredLevel; }
    public Long getValidatedById() { return validatedById; }
    public void setValidatedById(Long validatedById) { this.validatedById = validatedById; }
    public LocalDate getValidatedAt() { return validatedAt; }
    public void setValidatedAt(LocalDate validatedAt) { this.validatedAt = validatedAt; }
    public String getEvidenceDescription() { return evidenceDescription; }
    public void setEvidenceDescription(String evidenceDescription) { this.evidenceDescription = evidenceDescription; }
}
