package com.mydbs.backend.course.model;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.ClassRoom;
import com.mydbs.backend.academic.model.Program;
import com.mydbs.backend.common.model.BaseAuditEntity;
import com.mydbs.backend.user.model.User;
import jakarta.persistence.*;

@Entity
@Table(name = "courses",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_courses_code", columnNames = "code")
        },
        indexes = {
                @Index(name = "idx_courses_status", columnList = "status"),
                @Index(name = "idx_courses_program", columnList = "program_id"),
                @Index(name = "idx_courses_class", columnList = "class_id"),
                @Index(name = "idx_courses_year", columnList = "academic_year_id")
        })
public class Course extends BaseAuditEntity {

    @Column(name = "title", nullable = false, length = 180)
    private String title;

    @Column(name = "code", nullable = false, length = 40)
    private String code;

    @Column(name = "course_sheet", length = 3000)
    private String courseSheet;

    @Column(name = "objectives", length = 3000)
    private String objectives;

    @Column(name = "prerequisites", length = 3000)
    private String prerequisites;

    @Column(name = "syllabus", length = 6000)
    private String syllabus;

    @Column(name = "description", length = 4000)
    private String description;

    @Column(name = "credits", nullable = false)
    private Integer credits;

    @Column(name = "coefficient", nullable = false)
    private Double coefficient;

    @Column(name = "total_hours", nullable = false)
    private Integer totalHours;

    @Column(name = "published", nullable = false)
    private boolean published = false;

    @Column(name = "current_version_number", nullable = false)
    private Integer currentVersionNumber = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private CourseStatus status = CourseStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 30)
    private CourseVisibility visibility = CourseVisibility.INTERNAL;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_course_academic_year"))
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "program_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_course_program"))
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id",
            foreignKey = @ForeignKey(name = "fk_course_class"))
    private ClassRoom classRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_user_id",
            foreignKey = @ForeignKey(name = "fk_course_instructor_user"))
    private User instructor;

    public String getTitle() {
        return title;
    }

    public String getCode() {
        return code;
    }

    public String getCourseSheet() {
        return courseSheet;
    }

    public String getObjectives() {
        return objectives;
    }

    public String getPrerequisites() {
        return prerequisites;
    }

    public String getSyllabus() {
        return syllabus;
    }

    public String getDescription() {
        return description;
    }

    public Integer getCredits() {
        return credits;
    }

    public Double getCoefficient() {
        return coefficient;
    }

    public Integer getTotalHours() {
        return totalHours;
    }

    public boolean isPublished() {
        return published;
    }

    public Integer getCurrentVersionNumber() {
        return currentVersionNumber;
    }

    public CourseStatus getStatus() {
        return status;
    }

    public CourseVisibility getVisibility() {
        return visibility;
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

    public User getInstructor() {
        return instructor;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setCourseSheet(String courseSheet) {
        this.courseSheet = courseSheet;
    }

    public void setObjectives(String objectives) {
        this.objectives = objectives;
    }

    public void setPrerequisites(String prerequisites) {
        this.prerequisites = prerequisites;
    }

    public void setSyllabus(String syllabus) {
        this.syllabus = syllabus;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public void setCoefficient(Double coefficient) {
        this.coefficient = coefficient;
    }

    public void setTotalHours(Integer totalHours) {
        this.totalHours = totalHours;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    public void setCurrentVersionNumber(Integer currentVersionNumber) {
        this.currentVersionNumber = currentVersionNumber;
    }

    public void setStatus(CourseStatus status) {
        this.status = status;
    }

    public void setVisibility(CourseVisibility visibility) {
        this.visibility = visibility;
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

    public void setInstructor(User instructor) {
        this.instructor = instructor;
    }
}