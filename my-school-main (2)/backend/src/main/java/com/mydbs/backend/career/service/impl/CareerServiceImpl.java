package com.mydbs.backend.career.service.impl;

import com.mydbs.backend.career.dto.JobApplicationResponse;
import com.mydbs.backend.common.exception.DuplicateResourceException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.career.model.*;
import com.mydbs.backend.career.repository.*;
import com.mydbs.backend.user.model.User;
import com.mydbs.backend.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class CareerServiceImpl {

    private final JobOfferRepository jobOfferRepository;
    private final JobApplicationRepository applicationRepository;
    private final PortfolioProjectRepository portfolioRepository;
    private final UserRepository userRepository;

    public CareerServiceImpl(JobOfferRepository jobOfferRepository,
                              JobApplicationRepository applicationRepository,
                              PortfolioProjectRepository portfolioRepository,
                              UserRepository userRepository) {
        this.jobOfferRepository = jobOfferRepository;
        this.applicationRepository = applicationRepository;
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
    }

    // Job Offers
    public JobOffer createOffer(Long postedById, String title, String company, String description,
                                 String offerType, String location, boolean remote,
                                 LocalDate deadline, LocalDate startDate, Integer durationMonths,
                                 String contactEmail, String programIds) {
        JobOffer offer = new JobOffer();
        offer.setPostedById(postedById);
        offer.setTitle(title);
        offer.setCompanyName(company);
        offer.setDescription(description);
        offer.setOfferType(offerType);
        offer.setLocation(location);
        offer.setRemotePossible(remote);
        offer.setApplicationDeadline(deadline);
        offer.setStartDate(startDate);
        offer.setDurationMonths(durationMonths);
        offer.setContactEmail(contactEmail);
        offer.setProgramIds(programIds);
        return jobOfferRepository.save(offer);
    }

    @Transactional(readOnly = true)
    public Page<JobOffer> searchOpen(String type, String keyword, Pageable pageable) {
        return jobOfferRepository.searchOpen(LocalDate.now(), type, keyword, pageable);
    }

    public JobOffer closeOffer(Long offerId) {
        JobOffer offer = findOffer(offerId);
        offer.setStatus("CLOSED");
        return jobOfferRepository.save(offer);
    }

    // Job Applications
    public JobApplication apply(Long studentId, Long offerId, String coverLetter, String cvFilePath) {
        if (applicationRepository.existsByStudentIdAndJobOfferIdAndArchivedFalse(studentId, offerId)) {
            throw new DuplicateResourceException("Vous avez déjà postulé à cette offre");
        }
        JobOffer offer = findOffer(offerId);
        if (!"OPEN".equals(offer.getStatus())) {
            throw new IllegalStateException("Cette offre n'est plus ouverte aux candidatures");
        }
        JobApplication app = new JobApplication();
        app.setStudentId(studentId);
        app.setJobOffer(offer);
        app.setCoverLetter(coverLetter);
        app.setCvFilePath(cvFilePath);
        app.setAppliedAt(LocalDate.now());
        return applicationRepository.save(app);
    }

    public JobApplication updateApplicationStatus(Long appId, String status, String recruiterNotes) {
        JobApplication app = applicationRepository.findById(appId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature introuvable : " + appId));
        app.setStatus(status);
        if (recruiterNotes != null) app.setRecruiterNotes(recruiterNotes);
        return applicationRepository.save(app);
    }

    @Transactional(readOnly = true)
    public Page<JobApplication> getStudentApplications(Long studentId, Pageable pageable) {
        return applicationRepository.findByStudentIdAndArchivedFalseOrderByCreatedAtDesc(studentId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<JobApplicationResponse> getOfferApplications(Long offerId, Pageable pageable) {
        Page<JobApplication> page = applicationRepository.findByJobOfferIdAndArchivedFalseOrderByCreatedAtDesc(offerId, pageable);

        // Batch-load students to avoid N+1
        Set<Long> studentIds = page.getContent().stream()
                .map(JobApplication::getStudentId)
                .collect(Collectors.toSet());
        Map<Long, User> userMap = userRepository.findAllById(studentIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        List<JobApplicationResponse> dtos = page.getContent().stream().map(app -> {
            User u = userMap.get(app.getStudentId());
            return JobApplicationResponse.from(
                    app,
                    u != null ? u.getFirstName() : null,
                    u != null ? u.getLastName()  : null,
                    u != null ? u.getEmail()     : null,
                    u != null ? u.getPhotoUrl()  : null,
                    u != null ? u.getUserCode()  : null
            );
        }).collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    // Portfolio
    public PortfolioProject addProject(Long studentId, String title, String description,
                                        String projectUrl, String repoUrl, String technologies,
                                        LocalDate startDate, LocalDate endDate,
                                        boolean publiclyVisible, Long courseId) {
        PortfolioProject project = new PortfolioProject();
        project.setStudentId(studentId);
        project.setTitle(title);
        project.setDescription(description);
        project.setProjectUrl(projectUrl);
        project.setRepositoryUrl(repoUrl);
        project.setTechnologies(technologies);
        project.setStartDate(startDate);
        project.setEndDate(endDate);
        project.setPubliclyVisible(publiclyVisible);
        project.setCourseId(courseId);
        return portfolioRepository.save(project);
    }

    @Transactional(readOnly = true)
    public List<PortfolioProject> getStudentPortfolio(Long studentId) {
        return portfolioRepository.findByStudentIdAndArchivedFalseOrderByStartDateDesc(studentId);
    }

    @Transactional(readOnly = true)
    public Page<PortfolioProject> getPublicShowcase(Pageable pageable) {
        return portfolioRepository.findByPubliclyVisibleTrueAndArchivedFalseOrderByCreatedAtDesc(pageable);
    }

    private JobOffer findOffer(Long id) {
        return jobOfferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offre introuvable : " + id));
    }
}
