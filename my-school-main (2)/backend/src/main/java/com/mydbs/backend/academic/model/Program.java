package com.mydbs.backend.academic.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "programs",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_programs_code", columnNames = "code")
        },
        indexes = {
                @Index(name = "idx_programs_status", columnList = "status"),
                @Index(name = "idx_programs_level", columnList = "level")
        })
public class Program extends BaseAuditEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "code", nullable = false, length = 40)
    private String code;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "department_name", length = 150)
    private String departmentName;

    @Column(name = "faculty_name", length = 150)
    private String facultyName;

    @Column(name = "level", nullable = false, length = 80)
    private String level;

    @Column(name = "duration_in_months", nullable = false)
    private Integer durationInMonths;

    @Column(name = "credits_required", nullable = false)
    private Integer creditsRequired;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ProgramStatus status = ProgramStatus.DRAFT;

    public String getName() {
        return name;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public String getLevel() {
        return level;
    }

    public Integer getDurationInMonths() {
        return durationInMonths;
    }

    public Integer getCreditsRequired() {
        return creditsRequired;
    }

    public ProgramStatus getStatus() {
        return status;
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

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public void setDurationInMonths(Integer durationInMonths) {
        this.durationInMonths = durationInMonths;
    }

    public void setCreditsRequired(Integer creditsRequired) {
        this.creditsRequired = creditsRequired;
    }

    public void setStatus(ProgramStatus status) {
        this.status = status;
    }
}