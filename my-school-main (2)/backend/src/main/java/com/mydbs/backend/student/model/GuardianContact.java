package com.mydbs.backend.student.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "guardian_contacts",
        indexes = {
                @Index(name = "idx_guardian_student", columnList = "student_id")
        })
public class GuardianContact extends BaseAuditEntity {

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

    @Column(name = "city", length = 120)
    private String city;

    @Column(name = "country", length = 120)
    private String country;

    @Column(name = "primary_contact", nullable = false)
    private boolean primaryContact = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_guardian_student"))
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

    public String getCity() {
        return city;
    }

    public String getCountry() {
        return country;
    }

    public boolean isPrimaryContact() {
        return primaryContact;
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

    public void setCity(String city) {
        this.city = city;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setPrimaryContact(boolean primaryContact) {
        this.primaryContact = primaryContact;
    }

    public void setStudent(Student student) {
        this.student = student;
    }
}