package com.mydbs.backend.teacher.model;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.ClassRoom;
import com.mydbs.backend.academic.model.Program;
import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.user.model.User;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "teachers",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_teachers_teacher_number", columnNames = "teacher_number"),
                @UniqueConstraint(name = "uk_teachers_user_id", columnNames = "user_id")
        },
        indexes = {
                @Index(name = "idx_teachers_status", columnList = "status"),
                @Index(name = "idx_teachers_program", columnList = "program_id"),
                @Index(name = "idx_teachers_class", columnList = "class_id"),
                @Index(name = "idx_teachers_year", columnList = "academic_year_id")
        })
public class Teacher extends BaseAuditEntity {

    @Column(name = "teacher_number", nullable = false, length = 50)
    private String teacherNumber;

    @Column(name = "employee_number", length = 50)
    private String employeeNumber;

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

    @Column(name = "bio", length = 4000)
    private String bio;

    @Column(name = "special_notes", length = 2000)
    private String specialNotes;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "end_contract_date")
    private LocalDate endContractDate;

    @Column(name = "office_location", length = 180)
    private String officeLocation;

    @Column(name = "office_hours", length = 500)
    private String officeHours;

    @Column(name = "highest_degree", length = 180)
    private String highestDegree;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "teaching_hours_quota")
    private Integer teachingHoursQuota;

    @Column(name = "remote_available", nullable = false)
    private boolean remoteAvailable = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private TeacherStatus status = TeacherStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false, length = 30)
    private EmploymentType employmentType = EmploymentType.FULL_TIME;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",
            foreignKey = @ForeignKey(name = "fk_teacher_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_teacher_academic_year"))
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "program_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_teacher_program"))
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id",
            foreignKey = @ForeignKey(name = "fk_teacher_class"))
    private ClassRoom classRoom;

    public String getTeacherNumber() {
        return teacherNumber;
    }

    public void setTeacherNumber(String teacherNumber) {
        this.teacherNumber = teacherNumber;
    }

    public String getEmployeeNumber() {
        return employeeNumber;
    }

    public void setEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getMiddleName() {
        return middleName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
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

    public String getBio() {
        return bio;
    }

    public String getSpecialNotes() {
        return specialNotes;
    }

    public LocalDate getHireDate() {
        return hireDate;
    }

    public LocalDate getEndContractDate() {
        return endContractDate;
    }

    public String getOfficeLocation() {
        return officeLocation;
    }

    public String getOfficeHours() {
        return officeHours;
    }

    public String getHighestDegree() {
        return highestDegree;
    }

    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }

    public Integer getTeachingHoursQuota() {
        return teachingHoursQuota;
    }

    public boolean isRemoteAvailable() {
        return remoteAvailable;
    }

    public TeacherStatus getStatus() {
        return status;
    }

    public EmploymentType getEmploymentType() {
        return employmentType;
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

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setSpecialNotes(String specialNotes) {
        this.specialNotes = specialNotes;
    }

    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
    }

    public void setEndContractDate(LocalDate endContractDate) {
        this.endContractDate = endContractDate;
    }

    public void setOfficeLocation(String officeLocation) {
        this.officeLocation = officeLocation;
    }

    public void setOfficeHours(String officeHours) {
        this.officeHours = officeHours;
    }

    public void setHighestDegree(String highestDegree) {
        this.highestDegree = highestDegree;
    }

    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public void setTeachingHoursQuota(Integer teachingHoursQuota) {
        this.teachingHoursQuota = teachingHoursQuota;
    }

    public void setRemoteAvailable(boolean remoteAvailable) {
        this.remoteAvailable = remoteAvailable;
    }

    public void setStatus(TeacherStatus status) {
        this.status = status;
    }

    public void setEmploymentType(EmploymentType employmentType) {
        this.employmentType = employmentType;
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

    public void setClassRoom(ClassRoom classRoom) {
        this.classRoom = classRoom;
    }
}