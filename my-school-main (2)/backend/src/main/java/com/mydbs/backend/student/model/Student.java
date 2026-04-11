package com.mydbs.backend.student.model;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.ClassRoom;
import com.mydbs.backend.academic.model.Cohort;
import com.mydbs.backend.academic.model.Program;
import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.user.model.User;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "students",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_students_student_number", columnNames = "student_number"),
                @UniqueConstraint(name = "uk_students_user_id", columnNames = "user_id")
        },
        indexes = {
                @Index(name = "idx_students_status", columnList = "status"),
                @Index(name = "idx_students_program", columnList = "program_id"),
                @Index(name = "idx_students_class", columnList = "class_id"),
                @Index(name = "idx_students_cohort", columnList = "cohort_id"),
                @Index(name = "idx_students_year", columnList = "academic_year_id")
        })
public class Student extends BaseAuditEntity {

    @Column(name = "student_number", nullable = false, length = 50)
    private String studentNumber;

    @Column(name = "admission_number", length = 50)
    private String admissionNumber;

    @Column(name = "registration_number", length = 50)
    private String registrationNumber;

    @Column(name = "first_name", nullable = false, length = 120)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 120)
    private String lastName;

    @Column(name = "middle_name", length = 120)
    private String middleName;

    @Column(name = "email", length = 180)
    private String email;

    @Column(name = "phone_number", length = 40)
    private String phoneNumber;

    @Column(name = "secondary_phone_number", length = 40)
    private String secondaryPhoneNumber;

    @Column(name = "gender", length = 30)
    private String gender;

    @Column(name = "nationality", length = 80)
    private String nationality;

    @Column(name = "city_of_birth", length = 120)
    private String cityOfBirth;

    @Column(name = "country_of_birth", length = 120)
    private String countryOfBirth;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

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

    @Column(name = "photo_url", length = 1000)
    private String photoUrl;

    @Column(name = "medical_notes", length = 2000)
    private String medicalNotes;

    @Column(name = "special_needs_notes", length = 2000)
    private String specialNeedsNotes;

    @Column(name = "admission_date")
    private LocalDate admissionDate;

    @Column(name = "registration_date")
    private LocalDate registrationDate;

    @Column(name = "expected_graduation_date")
    private LocalDate expectedGraduationDate;

    @Column(name = "scholarship_holder", nullable = false)
    private boolean scholarshipHolder = false;

    @Column(name = "international_student", nullable = false)
    private boolean internationalStudent = false;

    @Column(name = "working_student", nullable = false)
    private boolean workingStudent = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private StudentStatus status = StudentStatus.APPLIED;

    @Enumerated(EnumType.STRING)
    @Column(name = "enrollment_type", nullable = false, length = 30)
    private EnrollmentType enrollmentType = EnrollmentType.NEW_ADMISSION;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",
            foreignKey = @ForeignKey(name = "fk_student_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_student_academic_year"))
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "program_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_student_program"))
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cohort_id",
            foreignKey = @ForeignKey(name = "fk_student_cohort"))
    private Cohort cohort;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id",
            foreignKey = @ForeignKey(name = "fk_student_class"))
    private ClassRoom classRoom;

    public String getStudentNumber() {
        return studentNumber;
    }

    public void setStudentNumber(String studentNumber) {
        this.studentNumber = studentNumber;
    }

    public String getAdmissionNumber() {
        return admissionNumber;
    }

    public void setAdmissionNumber(String admissionNumber) {
        this.admissionNumber = admissionNumber;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getMiddleName() {
        return middleName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setMiddleName(String middleName) {
        this.middleName = middleName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getSecondaryPhoneNumber() {
        return secondaryPhoneNumber;
    }

    public String getGender() {
        return gender;
    }

    public String getNationality() {
        return nationality;
    }

    public String getCityOfBirth() {
        return cityOfBirth;
    }

    public String getCountryOfBirth() {
        return countryOfBirth;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public String getNationalIdNumber() {
        return nationalIdNumber;
    }

    public String getPassportNumber() {
        return passportNumber;
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

    public String getPostalCode() {
        return postalCode;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public String getMedicalNotes() {
        return medicalNotes;
    }

    public String getSpecialNeedsNotes() {
        return specialNeedsNotes;
    }

    public LocalDate getAdmissionDate() {
        return admissionDate;
    }

    public LocalDate getRegistrationDate() {
        return registrationDate;
    }

    public LocalDate getExpectedGraduationDate() {
        return expectedGraduationDate;
    }

    public boolean isScholarshipHolder() {
        return scholarshipHolder;
    }

    public boolean isInternationalStudent() {
        return internationalStudent;
    }

    public boolean isWorkingStudent() {
        return workingStudent;
    }

    public StudentStatus getStatus() {
        return status;
    }

    public EnrollmentType getEnrollmentType() {
        return enrollmentType;
    }

    public User getUser() {
        return user;
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

    public ClassRoom getClassRoom() {
        return classRoom;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setSecondaryPhoneNumber(String secondaryPhoneNumber) {
        this.secondaryPhoneNumber = secondaryPhoneNumber;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    public void setCityOfBirth(String cityOfBirth) {
        this.cityOfBirth = cityOfBirth;
    }

    public void setCountryOfBirth(String countryOfBirth) {
        this.countryOfBirth = countryOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public void setNationalIdNumber(String nationalIdNumber) {
        this.nationalIdNumber = nationalIdNumber;
    }

    public void setPassportNumber(String passportNumber) {
        this.passportNumber = passportNumber;
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

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public void setMedicalNotes(String medicalNotes) {
        this.medicalNotes = medicalNotes;
    }

    public void setSpecialNeedsNotes(String specialNeedsNotes) {
        this.specialNeedsNotes = specialNeedsNotes;
    }

    public void setAdmissionDate(LocalDate admissionDate) {
        this.admissionDate = admissionDate;
    }

    public void setRegistrationDate(LocalDate registrationDate) {
        this.registrationDate = registrationDate;
    }

    public void setExpectedGraduationDate(LocalDate expectedGraduationDate) {
        this.expectedGraduationDate = expectedGraduationDate;
    }

    public void setScholarshipHolder(boolean scholarshipHolder) {
        this.scholarshipHolder = scholarshipHolder;
    }

    public void setInternationalStudent(boolean internationalStudent) {
        this.internationalStudent = internationalStudent;
    }

    public void setWorkingStudent(boolean workingStudent) {
        this.workingStudent = workingStudent;
    }

    public void setStatus(StudentStatus status) {
        this.status = status;
    }

    public void setEnrollmentType(EnrollmentType enrollmentType) {
        this.enrollmentType = enrollmentType;
    }

    public void setUser(User user) {
        this.user = user;
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

    public void setClassRoom(ClassRoom classRoom) {
        this.classRoom = classRoom;
    }
}