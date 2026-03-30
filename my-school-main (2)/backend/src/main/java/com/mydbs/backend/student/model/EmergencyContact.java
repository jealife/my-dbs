package com.mydbs.backend.student.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "emergency_contacts",
        indexes = {
                @Index(name = "idx_emergency_student", columnList = "student_id")
        })
public class EmergencyContact extends BaseAuditEntity {

    @Column(name = "full_name", nullable = false, length = 180)
    private String fullName;

    @Column(name = "relationship_label", nullable = false, length = 80)
    private String relationshipLabel;

    @Column(name = "phone_number", nullable = false, length = 40)
    private String phoneNumber;

    @Column(name = "secondary_phone_number", length = 40)
    private String secondaryPhoneNumber;

    @Column(name = "email", length = 180)
    private String email;

    @Column(name = "address_line", length = 255)
    private String addressLine;

    @Column(name = "priority_order", nullable = false)
    private Integer priorityOrder = 1;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_emergency_student"))
    private Student student;

    public String getFullName() {
        return fullName;
    }

    public String getRelationshipLabel() {
        return relationshipLabel;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getSecondaryPhoneNumber() {
        return secondaryPhoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public Integer getPriorityOrder() {
        return priorityOrder;
    }

    public Student getStudent() {
        return student;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setRelationshipLabel(String relationshipLabel) {
        this.relationshipLabel = relationshipLabel;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setSecondaryPhoneNumber(String secondaryPhoneNumber) {
        this.secondaryPhoneNumber = secondaryPhoneNumber;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }

    public void setPriorityOrder(Integer priorityOrder) {
        this.priorityOrder = priorityOrder;
    }

    public void setStudent(Student student) {
        this.student = student;
    }
}