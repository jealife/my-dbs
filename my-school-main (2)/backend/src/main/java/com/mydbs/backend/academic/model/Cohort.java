package com.mydbs.backend.academic.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "cohorts",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_cohorts_code", columnNames = "code")
        },
        indexes = {
                @Index(name = "idx_cohorts_status", columnList = "status")
        })
public class Cohort extends BaseAuditEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "code", nullable = false, length = 40)
    private String code;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "max_capacity")
    private Integer maxCapacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private CohortStatus status = CohortStatus.PLANNED;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_cohort_academic_year"))
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "program_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_cohort_program"))
    private Program program;

    public String getName() {
        return name;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public CohortStatus getStatus() {
        return status;
    }

    public AcademicYear getAcademicYear() {
        return academicYear;
    }

    public Program getProgram() {
        return program;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public void setStatus(CohortStatus status) {
        this.status = status;
    }

    public void setAcademicYear(AcademicYear academicYear) {
        this.academicYear = academicYear;
    }

    public void setProgram(Program program) {
        this.program = program;
    }
}