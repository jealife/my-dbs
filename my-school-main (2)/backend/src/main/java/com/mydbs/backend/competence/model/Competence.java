package com.mydbs.backend.competence.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

/** Competence = une compétence du référentiel académique. */
@Entity
@Table(name = "competences",
        indexes = {
                @Index(name = "idx_competence_domain", columnList = "domain"),
                @Index(name = "idx_competence_program", columnList = "program_id")
        })
public class Competence extends BaseAuditEntity {

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;  // ex: PROG-001

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "domain", length = 150)
    private String domain;  // ex: Programmation, Communication, Gestion de projet

    /** Niveau attendu : BEGINNER | INTERMEDIATE | ADVANCED | EXPERT */
    @Column(name = "expected_level", length = 20)
    private String expectedLevel;

    @Column(name = "program_id")
    private Long programId;

    // Getters & Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public String getExpectedLevel() { return expectedLevel; }
    public void setExpectedLevel(String expectedLevel) { this.expectedLevel = expectedLevel; }
    public Long getProgramId() { return programId; }
    public void setProgramId(Long programId) { this.programId = programId; }
}
