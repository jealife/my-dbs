package com.mydbs.backend.admissions.model;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.Cohort;
import com.mydbs.backend.academic.model.Program;
import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.student.model.Student;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "admission_applications",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_admission_application_number", columnNames = "application_number")
        },
        indexes = {
                @Index(name = "idx_admission_status", columnList = "status"),
                @Index(name = "idx_admission_email", columnList = "email"),
                @Index(name = "idx_admission_academic_year", columnList = "academic_year_id"),
                @Index(name = "idx_admission_program", columnList = "program_id"),
                @Index(name = "idx_admission_priority", columnList = "priority")
        })
public class AdmissionApplication extends BaseAuditEntity {

    @Column(name = "application_number", nullable = false, length = 50)
    private String applicationNumber;

    @Column(name = "first_name", nullable = false, length = 120)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 120)
    private String lastName;

    @Column(name = "middle_name", length = 120)
    private String middleName;

    @Column(name = "email", nullable = false, length = 180)
    private String email;

    @Column(name = "phone_number", length = 40)
    private String phoneNumber;

    @Column(name = "secondary_phone_number", length = 40)
    private String secondaryPhoneNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 30)
    private String gender;

    @Column(name = "city_of_birth", length = 120)
    private String cityOfBirth;

    @Column(name = "country_of_birth", length = 120)
    private String countryOfBirth;

    @Column(name = "national_id_number", length = 100)
    private String nationalIdNumber;

    @Column(name = "passport_number", length = 100)
    private String passportNumber;

    @Column(name = "address_line", length = 255)
    private String addressLine;

    @Column(name = "city", length = 120)
    private String city;

    @Column(name = "country", length = 120)
    private String country;

    @Column(name = "postal_code", length = 30)
    private String postalCode;

    @Column(name = "nationality", length = 80)
    private String nationality;

    @Column(name = "motivation_letter", columnDefinition = "TEXT")
    private String motivationLetter;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ApplicationStatus status = ApplicationStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private ApplicationPriority priority = ApplicationPriority.NORMAL;

    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    @Column(name = "review_notes", length = 2000)
    private String reviewNotes;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "decided_at")
    private LocalDateTime decidedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "program_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_admission_program"))
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_admission_academic_year"))
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cohort_id",
            foreignKey = @ForeignKey(name = "fk_admission_cohort"))
    private Cohort cohort;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id",
            foreignKey = @ForeignKey(name = "fk_admission_student"))
    private Student student;

    public String getApplicationNumber() { return applicationNumber; }
    public void setApplicationNumber(String applicationNumber) { this.applicationNumber = applicationNumber; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAddressLine() { return addressLine; }
    public void setAddressLine(String addressLine) { this.addressLine = addressLine; }

    public String getMotivationLetter() { return motivationLetter; }
    public void setMotivationLetter(String motivationLetter) { this.motivationLetter = motivationLetter; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public ApplicationPriority getPriority() { return priority; }
    public void setPriority(ApplicationPriority priority) { this.priority = priority; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getDecidedAt() { return decidedAt; }
    public void setDecidedAt(LocalDateTime decidedAt) { this.decidedAt = decidedAt; }

    public Program getProgram() { return program; }
    public void setProgram(Program program) { this.program = program; }

    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }

    public Cohort getCohort() { return cohort; }
    public void setCohort(Cohort cohort) { this.cohort = cohort; }

    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }

    public String getSecondaryPhoneNumber() { return secondaryPhoneNumber; }
    public void setSecondaryPhoneNumber(String secondaryPhoneNumber) { this.secondaryPhoneNumber = secondaryPhoneNumber; }

    public String getCityOfBirth() { return cityOfBirth; }
    public void setCityOfBirth(String cityOfBirth) { this.cityOfBirth = cityOfBirth; }

    public String getCountryOfBirth() { return countryOfBirth; }
    public void setCountryOfBirth(String countryOfBirth) { this.countryOfBirth = countryOfBirth; }

    public String getNationalIdNumber() { return nationalIdNumber; }
    public void setNationalIdNumber(String nationalIdNumber) { this.nationalIdNumber = nationalIdNumber; }

    public String getPassportNumber() { return passportNumber; }
    public void setPassportNumber(String passportNumber) { this.passportNumber = passportNumber; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
}
