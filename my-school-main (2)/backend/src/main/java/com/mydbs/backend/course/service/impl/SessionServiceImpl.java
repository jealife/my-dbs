package com.mydbs.backend.course.service.impl;

import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.course.dto.SessionCreateRequest;
import com.mydbs.backend.course.dto.SessionResponse;
import com.mydbs.backend.course.dto.SessionUpdateRequest;
import com.mydbs.backend.course.model.Course;
import com.mydbs.backend.course.model.Lesson;
import com.mydbs.backend.course.model.Session;
import com.mydbs.backend.course.repository.CourseRepository;
import com.mydbs.backend.course.repository.LessonRepository;
import com.mydbs.backend.course.repository.SessionRepository;
import com.mydbs.backend.course.service.SessionService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SessionServiceImpl implements SessionService {

    private final SessionRepository sessionRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;

    public SessionServiceImpl(SessionRepository sessionRepository,
                              CourseRepository courseRepository,
                              LessonRepository lessonRepository) {
        this.sessionRepository = sessionRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
    }

    @Override
    public SessionResponse create(Long courseId, SessionCreateRequest request) {
        validateDates(request.startAt(), request.endAt());

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable avec l'id : " + courseId));

        Lesson lesson = null;
        if (request.lessonId() != null) {
            lesson = lessonRepository.findById(request.lessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lecon introuvable avec l'id : " + request.lessonId()));
        }

        Session session = new Session();
        session.setTitle(request.title());
        session.setDescription(request.description());
        session.setStartAt(request.startAt());
        session.setEndAt(request.endAt());
        session.setTimezone(request.timezone());
        session.setMeetingLink(request.meetingLink());
        session.setRecordingLink(request.recordingLink());
        session.setLocationLabel(request.locationLabel());
        session.setMode(request.mode());
        session.setStatus(request.status() != null ? request.status() : com.mydbs.backend.course.model.SessionStatus.PLANNED);
        session.setCourse(course);
        session.setLesson(lesson);

        return map(sessionRepository.save(session));
    }

    @Override
    public List<SessionResponse> getByCourse(Long courseId) {
        return sessionRepository.findByCourseIdAndArchivedFalseOrderByStartAtAsc(courseId)
                .stream().map(this::map).toList();
    }

    @Override
    public SessionResponse update(Long id, SessionUpdateRequest request) {
        validateDates(request.startAt(), request.endAt());

        Session session = findActive(id);

        Lesson lesson = null;
        if (request.lessonId() != null) {
            lesson = lessonRepository.findById(request.lessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lecon introuvable avec l'id : " + request.lessonId()));
        }

        session.setTitle(request.title());
        session.setDescription(request.description());
        session.setStartAt(request.startAt());
        session.setEndAt(request.endAt());
        session.setTimezone(request.timezone());
        session.setMeetingLink(request.meetingLink());
        session.setRecordingLink(request.recordingLink());
        session.setLocationLabel(request.locationLabel());
        session.setMode(request.mode());
        session.setStatus(request.status());
        session.setLesson(lesson);

        return map(sessionRepository.save(session));
    }

    @Override
    public void archive(Long id) {
        Session session = findActive(id);
        session.setArchived(true);
        sessionRepository.save(session);
    }

    private Session findActive(Long id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seance introuvable avec l'id : " + id));
        if (session.isArchived()) {
            throw new ResourceNotFoundException("Seance introuvable avec l'id : " + id);
        }
        return session;
    }

    private void validateDates(java.time.LocalDateTime startAt, java.time.LocalDateTime endAt) {
        if (!startAt.isBefore(endAt)) {
            throw new IllegalArgumentException("La date de debut doit etre strictement inferieure a la date de fin");
        }
    }

    private SessionResponse map(Session session) {
        return new SessionResponse(
                session.getId(),
                session.getTitle(),
                session.getDescription(),
                session.getStartAt(),
                session.getEndAt(),
                session.getTimezone(),
                session.getMeetingLink(),
                session.getRecordingLink(),
                session.getLocationLabel(),
                session.getMode(),
                session.getStatus(),
                session.getCourse().getId(),
                session.getCourse().getTitle(),
                session.getLesson() != null ? session.getLesson().getId() : null,
                session.getLesson() != null ? session.getLesson().getTitle() : null,
                session.getCreatedAt(),
                session.getUpdatedAt(),
                session.getCreatedBy(),
                session.getUpdatedBy()
        );
    }
}