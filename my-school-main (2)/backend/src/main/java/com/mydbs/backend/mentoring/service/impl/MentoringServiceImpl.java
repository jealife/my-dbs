package com.mydbs.backend.mentoring.service.impl;

import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.mentoring.model.*;
import com.mydbs.backend.mentoring.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class MentoringServiceImpl {

    private final MentorshipRepository mentorshipRepository;
    private final MentoringSessionRepository sessionRepository;
    private final ActionPlanRepository actionPlanRepository;

    public MentoringServiceImpl(MentorshipRepository mentorshipRepository,
                                 MentoringSessionRepository sessionRepository,
                                 ActionPlanRepository actionPlanRepository) {
        this.mentorshipRepository = mentorshipRepository;
        this.sessionRepository = sessionRepository;
        this.actionPlanRepository = actionPlanRepository;
    }

    // Mentorship
    public Mentorship createMentorship(Long mentorId, Long menteeId, String goals,
                                        LocalDate startDate, LocalDate endDate, Long academicYearId) {
        Mentorship m = new Mentorship();
        m.setMentorId(mentorId);
        m.setMenteeId(menteeId);
        m.setGoals(goals);
        m.setStartDate(startDate);
        m.setEndDate(endDate);
        m.setAcademicYearId(academicYearId);
        return mentorshipRepository.save(m);
    }

    public Mentorship updateStatus(Long id, String status) {
        Mentorship m = findMentorship(id);
        m.setStatus(status);
        return mentorshipRepository.save(m);
    }

    @Transactional(readOnly = true)
    public Page<Mentorship> getMenteeMentorships(Long menteeId, Pageable pageable) {
        return mentorshipRepository.findByMenteeIdAndArchivedFalseOrderByCreatedAtDesc(menteeId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Mentorship> getMentorMentorships(Long mentorId, Pageable pageable) {
        return mentorshipRepository.findByMentorIdAndArchivedFalseOrderByCreatedAtDesc(mentorId, pageable);
    }

    // Sessions
    public MentoringSession addSession(Long mentorshipId, LocalDate date, java.time.LocalTime startTime,
                                        java.time.LocalTime endTime, String location, String notes) {
        Mentorship m = findMentorship(mentorshipId);
        MentoringSession session = new MentoringSession();
        session.setMentorship(m);
        session.setSessionDate(date);
        session.setStartTime(startTime);
        session.setEndTime(endTime);
        session.setLocation(location);
        session.setNotes(notes);
        return sessionRepository.save(session);
    }

    public MentoringSession updateSessionStatus(Long sessionId, String status, String notes) {
        MentoringSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Séance introuvable : " + sessionId));
        session.setStatus(status);
        if (notes != null) session.setNotes(notes);
        return sessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public List<MentoringSession> getSessions(Long mentorshipId) {
        return sessionRepository.findByMentorshipIdAndArchivedFalseOrderBySessionDateDesc(mentorshipId);
    }

    // Action Plans
    public ActionPlan addActionPlan(Long mentorshipId, String title, String description, LocalDate dueDate) {
        Mentorship m = findMentorship(mentorshipId);
        ActionPlan plan = new ActionPlan();
        plan.setMentorship(m);
        plan.setTitle(title);
        plan.setDescription(description);
        plan.setDueDate(dueDate);
        return actionPlanRepository.save(plan);
    }

    public ActionPlan completeActionPlan(Long planId) {
        ActionPlan plan = actionPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan introuvable : " + planId));
        plan.setCompleted(true);
        plan.setCompletedAt(LocalDate.now());
        return actionPlanRepository.save(plan);
    }

    @Transactional(readOnly = true)
    public List<ActionPlan> getActionPlans(Long mentorshipId) {
        return actionPlanRepository.findByMentorshipIdAndArchivedFalseOrderByDueDateAsc(mentorshipId);
    }

    private Mentorship findMentorship(Long id) {
        Mentorship m = mentorshipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorat introuvable : " + id));
        if (m.isArchived()) throw new ResourceNotFoundException("Mentorat introuvable : " + id);
        return m;
    }
}
