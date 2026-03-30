package com.mydbs.backend.career.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

/** JobOffer = offre de stage ou d'emploi publiée sur la plateforme. */
@Entity
@Table(name = "job_offers",
        indexes = {
                @Index(name = "idx_job_type", columnList = "offer_type"),
                @Index(name = "idx_job_status", columnList = "status"),
                @Index(name = "idx_job_deadline", columnList = "application_deadline")
        })
public class JobOffer extends BaseAuditEntity {

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "company_name", nullable = false, length = 200)
    private String companyName;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    /** INTERNSHIP | JOB | APPRENTICESHIP */
    @Column(name = "offer_type", nullable = false, length = 30)
    private String offerType;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "remote_possible", nullable = false)
    private boolean remotePossible = false;

    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "duration_months")
    private Integer durationMonths;

    /** OPEN | CLOSED | EXPIRED */
    @Column(name = "status", nullable = false, length = 20)
    private String status = "OPEN";

    @Column(name = "contact_email", length = 150)
    private String contactEmail;

    @Column(name = "program_ids", length = 500)
    private String programIds;   // CSV d'IDs de programmes cibles

    @Column(name = "posted_by_id")
    private Long postedById;

    // Getters & Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getOfferType() { return offerType; }
    public void setOfferType(String offerType) { this.offerType = offerType; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public boolean isRemotePossible() { return remotePossible; }
    public void setRemotePossible(boolean remotePossible) { this.remotePossible = remotePossible; }
    public LocalDate getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(LocalDate applicationDeadline) { this.applicationDeadline = applicationDeadline; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public Integer getDurationMonths() { return durationMonths; }
    public void setDurationMonths(Integer durationMonths) { this.durationMonths = durationMonths; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getProgramIds() { return programIds; }
    public void setProgramIds(String programIds) { this.programIds = programIds; }
    public Long getPostedById() { return postedById; }
    public void setPostedById(Long postedById) { this.postedById = postedById; }
}
