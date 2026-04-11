package com.mydbs.backend.academic.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;

@Entity
@Table(name = "academic_years",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_academic_years_code", columnNames = "code")
        },
        indexes = {
                @Index(name = "idx_academic_years_status", columnList = "status"),
                @Index(name = "idx_academic_years_start_end", columnList = "start_date,end_date")
        })
public class AcademicYear extends BaseAuditEntity {

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "code", nullable = false, length = 40)
    private String code;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "current_year", nullable = false)
    private boolean currentYear = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private AcademicYearStatus status = AcademicYearStatus.PLANNED;

    public String getName() {
        return name;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public boolean isCurrentYear() {
        return currentYear;
    }

    public AcademicYearStatus getStatus() {
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

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public void setCurrentYear(boolean currentYear) {
        this.currentYear = currentYear;
    }

    public void setStatus(AcademicYearStatus status) {
        this.status = status;
    }
}