package com.mydbs.backend.career.dto;

import com.mydbs.backend.career.model.JobApplication;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** JobApplication enrichi avec les infos de l'étudiant (nom, email, photo). */
public class JobApplicationResponse {

    private Long id;
    private Long studentId;
    private String studentFirstName;
    private String studentLastName;
    private String studentEmail;
    private String studentPhotoUrl;
    private String studentUserCode;

    private Long jobOfferId;
    private String jobOfferTitle;
    private String jobOfferCompany;

    private String status;
    private String coverLetter;
    private String cvFilePath;
    private LocalDate appliedAt;
    private String recruiterNotes;
    private LocalDateTime createdAt;

    public JobApplicationResponse() {}

    /** Construit depuis l'entité + données utilisateur. */
    public static JobApplicationResponse from(JobApplication app,
                                               String firstName, String lastName,
                                               String email, String photoUrl, String userCode) {
        JobApplicationResponse dto = new JobApplicationResponse();
        dto.id            = app.getId();
        dto.studentId     = app.getStudentId();
        dto.studentFirstName = firstName;
        dto.studentLastName  = lastName;
        dto.studentEmail     = email;
        dto.studentPhotoUrl  = photoUrl;
        dto.studentUserCode  = userCode;
        dto.jobOfferId       = app.getJobOffer() != null ? app.getJobOffer().getId() : null;
        dto.jobOfferTitle    = app.getJobOffer() != null ? app.getJobOffer().getTitle() : null;
        dto.jobOfferCompany  = app.getJobOffer() != null ? app.getJobOffer().getCompanyName() : null;
        dto.status           = app.getStatus();
        dto.coverLetter      = app.getCoverLetter();
        dto.cvFilePath       = app.getCvFilePath();
        dto.appliedAt        = app.getAppliedAt();
        dto.recruiterNotes   = app.getRecruiterNotes();
        dto.createdAt        = app.getCreatedAt();
        return dto;
    }

    // Getters
    public Long getId()                  { return id; }
    public Long getStudentId()           { return studentId; }
    public String getStudentFirstName()  { return studentFirstName; }
    public String getStudentLastName()   { return studentLastName; }
    public String getStudentEmail()      { return studentEmail; }
    public String getStudentPhotoUrl()   { return studentPhotoUrl; }
    public String getStudentUserCode()   { return studentUserCode; }
    public Long getJobOfferId()          { return jobOfferId; }
    public String getJobOfferTitle()     { return jobOfferTitle; }
    public String getJobOfferCompany()   { return jobOfferCompany; }
    public String getStatus()            { return status; }
    public String getCoverLetter()       { return coverLetter; }
    public String getCvFilePath()        { return cvFilePath; }
    public LocalDate getAppliedAt()      { return appliedAt; }
    public String getRecruiterNotes()    { return recruiterNotes; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
}
