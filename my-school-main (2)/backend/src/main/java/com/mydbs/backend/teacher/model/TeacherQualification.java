package com.mydbs.backend.teacher.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "teacher_qualifications",
        indexes = {
                @Index(name = "idx_teacher_qualification_teacher", columnList = "teacher_id")
        })
public class TeacherQualification extends BaseAuditEntity {

    @Column(name = "title", nullable = false, length = 180)
    private String title;

    @Column(name = "institution_name", nullable = false, length = 180)
    private String institutionName;

    @Column(name = "country", length = 120)
    private String country;

    @Column(name = "year_awarded")
    private Integer yearAwarded;

    @Column(name = "description", length = 2000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_teacher_qualification_teacher"))
    private Teacher teacher;

    public String getTitle() {
        return title;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public String getCountry() {
        return country;
    }

    public Integer getYearAwarded() {
        return yearAwarded;
    }

    public String getDescription() {
        return description;
    }

    public Teacher getTeacher() {
        return teacher;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setYearAwarded(Integer yearAwarded) {
        this.yearAwarded = yearAwarded;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }
}