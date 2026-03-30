package com.mydbs.backend.academic.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "classes",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_classes_code", columnNames = "code")
        },
        indexes = {
                @Index(name = "idx_classes_status", columnList = "status")
        })
public class ClassRoom extends BaseAuditEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "code", nullable = false, length = 40)
    private String code;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "delivery_mode", nullable = false, length = 50)
    private String deliveryMode;

    @Column(name = "room_label", length = 100)
    private String roomLabel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ClassRoomStatus status = ClassRoomStatus.PLANNED;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_class_academic_year"))
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "program_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_class_program"))
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cohort_id",
            foreignKey = @ForeignKey(name = "fk_class_cohort"))
    private Cohort cohort;

    public String getName() {
        return name;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public String getDeliveryMode() {
        return deliveryMode;
    }

    public String getRoomLabel() {
        return roomLabel;
    }

    public ClassRoomStatus getStatus() {
        return status;
    }

    public AcademicYear getAcademicYear() {
        return academicYear;
    }

    public Program getProgram() {
        return program;
    }

    public Cohort getCohort() {
        return cohort;
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

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public void setDeliveryMode(String deliveryMode) {
        this.deliveryMode = deliveryMode;
    }

    public void setRoomLabel(String roomLabel) {
        this.roomLabel = roomLabel;
    }

    public void setStatus(ClassRoomStatus status) {
        this.status = status;
    }

    public void setAcademicYear(AcademicYear academicYear) {
        this.academicYear = academicYear;
    }

    public void setProgram(Program program) {
        this.program = program;
    }

    public void setCohort(Cohort cohort) {
        this.cohort = cohort;
    }
}