package com.mydbs.backend.planning.service.impl;

import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.planning.model.ScheduleEvent;
import com.mydbs.backend.planning.repository.ScheduleEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PlanningServiceImpl {

    private static final Logger log = LoggerFactory.getLogger(PlanningServiceImpl.class);

    private final ScheduleEventRepository eventRepository;

    public PlanningServiceImpl(ScheduleEventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    // ── CRÉATION ────────────────────────────────────────────────────────────

    public ScheduleEvent createEvent(String eventType, String title, String description,
                                      LocalDateTime startAt, LocalDateTime endAt, boolean allDay,
                                      String location, String meetingLink, String recurrenceRule,
                                      Long userId, Long cohortId, Long teacherId,
                                      Long referenceId, String referenceType) {
        ScheduleEvent event = new ScheduleEvent();
        event.setEventType(eventType);
        event.setTitle(title);
        event.setDescription(description);
        event.setStartAt(startAt);
        event.setEndAt(endAt);
        event.setAllDay(allDay);
        event.setLocation(location);
        event.setMeetingLink(meetingLink);
        event.setRecurrenceRule(recurrenceRule);
        event.setUserId(userId);
        event.setCohortId(cohortId);
        event.setTeacherId(teacherId);
        event.setReferenceId(referenceId);
        event.setReferenceType(referenceType);
        return eventRepository.save(event);
    }

    public ScheduleEvent updateEvent(Long id, String title, String description,
                                      LocalDateTime startAt, LocalDateTime endAt,
                                      String location, String meetingLink) {
        ScheduleEvent event = findEvent(id);
        if (title != null) event.setTitle(title);
        if (description != null) event.setDescription(description);
        if (startAt != null) event.setStartAt(startAt);
        if (endAt != null) event.setEndAt(endAt);
        if (location != null) event.setLocation(location);
        if (meetingLink != null) event.setMeetingLink(meetingLink);
        return eventRepository.save(event);
    }

    public ScheduleEvent cancelEvent(Long id, String reason) {
        ScheduleEvent event = findEvent(id);
        event.setStatus("CANCELLED");
        event.setCancellationReason(reason);
        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        ScheduleEvent event = findEvent(id);
        event.setArchived(true);
        eventRepository.save(event);
    }

    // ── CONSULTATION ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ScheduleEvent> getUserAgenda(Long userId, LocalDateTime from, LocalDateTime to) {
        return eventRepository.findByUserIdAndDateRange(userId, from, to);
    }

    @Transactional(readOnly = true)
    public List<ScheduleEvent> getCohortAgenda(Long cohortId, LocalDateTime from, LocalDateTime to) {
        return eventRepository.findByCohortIdAndDateRange(cohortId, from, to);
    }

    @Transactional(readOnly = true)
    public List<ScheduleEvent> getTeacherSlots(Long teacherId) {
        return eventRepository.findByTeacherIdAndArchivedFalseOrderByStartAtAsc(teacherId);
    }

    // ── CONFLITS ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ScheduleEvent> detectConflicts(Long eventId) {
        ScheduleEvent event = findEvent(eventId);
        List<ScheduleEvent> conflicts;
        if (event.getTeacherId() != null) {
            conflicts = eventRepository.findConflictsForTeacher(
                    event.getTeacherId(), event.getStartAt(), event.getEndAt());
        } else {
            conflicts = eventRepository.findConflictsForUser(
                    event.getUserId(), event.getStartAt(), event.getEndAt());
        }
        // Exclure l'événement lui-même
        return conflicts.stream().filter(e -> !e.getId().equals(eventId)).toList();
    }

    private ScheduleEvent findEvent(Long id) {
        ScheduleEvent e = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Événement introuvable : " + id));
        if (e.isArchived()) throw new ResourceNotFoundException("Événement introuvable : " + id);
        return e;
    }
}
