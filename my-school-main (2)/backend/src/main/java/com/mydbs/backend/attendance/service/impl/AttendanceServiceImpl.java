package com.mydbs.backend.attendance.service.impl;

import com.mydbs.backend.attendance.dto.*;
import com.mydbs.backend.attendance.model.*;
import com.mydbs.backend.attendance.repository.*;
import com.mydbs.backend.common.exception.DuplicateResourceException;
import com.mydbs.backend.common.exception.FileStorageException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.course.model.Session;
import com.mydbs.backend.course.repository.SessionRepository;
import com.mydbs.backend.student.model.Student;
import com.mydbs.backend.student.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AttendanceServiceImpl {

    private static final Logger log = LoggerFactory.getLogger(AttendanceServiceImpl.class);
    private static final double ALERT_THRESHOLD = 75.0; // % en dessous duquel une alerte est déclenchée

    private final AttendanceRecordRepository recordRepository;
    private final AttendanceJustificationRepository justificationRepository;
    private final SessionRepository sessionRepository;
    private final StudentRepository studentRepository;

    @Value("${app.storage.local.base-dir:uploads}")
    private String baseDir;

    public AttendanceServiceImpl(AttendanceRecordRepository recordRepository,
                                 AttendanceJustificationRepository justificationRepository,
                                 SessionRepository sessionRepository,
                                 StudentRepository studentRepository) {
        this.recordRepository = recordRepository;
        this.justificationRepository = justificationRepository;
        this.sessionRepository = sessionRepository;
        this.studentRepository = studentRepository;
    }

    // ─────────────────────── FEUILLE D'APPEL ────────────────────────────────

    /** Saisie individuelle : créer ou mettre à jour un enregistrement de présence */
    public AttendanceRecordResponse markAttendance(Long sessionId, AttendanceEntryRequest request) {
        Session session = findSession(sessionId);
        Student student = findStudent(request.studentId());

        AttendanceRecord record = recordRepository
                .findBySessionIdAndStudentIdAndArchivedFalse(sessionId, request.studentId())
                .orElseGet(() -> {
                    AttendanceRecord r = new AttendanceRecord();
                    r.setSession(session);
                    r.setStudent(student);
                    return r;
                });

        applyEntry(record, request);
        return toResponse(recordRepository.save(record));
    }

    /** Saisie en masse : feuille d'appel complète pour une session */
    public List<AttendanceRecordResponse> bulkMarkAttendance(BulkAttendanceRequest request) {
        Session session = findSession(request.sessionId());
        return request.entries().stream()
                .map(entry -> {
                    Student student = findStudent(entry.studentId());
                    AttendanceRecord record = recordRepository
                            .findBySessionIdAndStudentIdAndArchivedFalse(session.getId(), entry.studentId())
                            .orElseGet(() -> {
                                AttendanceRecord r = new AttendanceRecord();
                                r.setSession(session);
                                r.setStudent(student);
                                return r;
                            });
                    applyEntry(record, entry);
                    return toResponse(recordRepository.save(record));
                }).toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordResponse> getBySession(Long sessionId) {
        findSession(sessionId);
        return recordRepository.findBySessionIdAndArchivedFalse(sessionId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordResponse> getByStudent(Long studentId) {
        findStudent(studentId);
        return recordRepository.findByStudentIdAndArchivedFalseOrderByCreatedAtDesc(studentId)
                .stream().map(this::toResponse).toList();
    }

    public AttendanceRecordResponse updateRecord(Long recordId, AttendanceStatus status, String teacherNote) {
        AttendanceRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Enregistrement introuvable : " + recordId));
        record.setStatus(status);
        if (teacherNote != null) record.setTeacherNote(teacherNote);
        return toResponse(recordRepository.save(record));
    }

    public void deleteRecord(Long recordId) {
        AttendanceRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Enregistrement introuvable : " + recordId));
        record.setArchived(true);
        recordRepository.save(record);
    }

    // ─────────────────────── STATISTIQUES D'ASSIDUITÉ ───────────────────────

    @Transactional(readOnly = true)
    public AttendanceStatsResponse getStudentStats(Long studentId) {
        Student student = findStudent(studentId);
        long total = recordRepository.countTotalByStudent(studentId);
        long present = recordRepository.countPresentByStudent(studentId);
        return buildStats(student, null, null, total, present);
    }

    @Transactional(readOnly = true)
    public AttendanceStatsResponse getStudentStatsByCourse(Long studentId, Long courseId) {
        Student student = findStudent(studentId);
        long total = recordRepository.countTotalByStudentAndCourse(studentId, courseId);
        long present = recordRepository.countPresentByStudentAndCourse(studentId, courseId);
        return buildStats(student, courseId, null, total, present);
    }

    // ─────────────────────── JUSTIFICATIONS ─────────────────────────────────

    public JustificationResponse submitJustification(JustificationCreateRequest request, MultipartFile document) {
        Student student = findStudent(request.studentId());
        AttendanceRecord linkedRecord = null;
        if (request.attendanceRecordId() != null) {
            linkedRecord = recordRepository.findById(request.attendanceRecordId())
                    .orElseThrow(() -> new ResourceNotFoundException("Enregistrement introuvable"));
        }

        AttendanceJustification justification = new AttendanceJustification();
        justification.setStudent(student);
        justification.setAttendanceRecord(linkedRecord);
        justification.setReason(request.reason());
        justification.setAbsenceDateFrom(request.absenceDateFrom());
        justification.setAbsenceDateTo(request.absenceDateTo());

        if (document != null && !document.isEmpty()) {
            String path = storeFile(document, "justifications/" + student.getId());
            justification.setDocumentPath(path);
            justification.setDocumentName(document.getOriginalFilename());
        }

        return toJustificationResponse(justificationRepository.save(justification));
    }

    @Transactional(readOnly = true)
    public Page<JustificationResponse> getPendingJustifications(Pageable pageable) {
        return justificationRepository.findByStatusAndArchivedFalseOrderByCreatedAtAsc(
                JustificationStatus.PENDING, pageable).map(this::toJustificationResponse);
    }

    @Transactional(readOnly = true)
    public Page<JustificationResponse> getStudentJustifications(Long studentId, Pageable pageable) {
        findStudent(studentId);
        return justificationRepository.findByStudentIdAndArchivedFalseOrderByCreatedAtDesc(
                studentId, pageable).map(this::toJustificationResponse);
    }

    public JustificationResponse reviewJustification(Long justId, JustificationStatus decision, String comment) {
        AttendanceJustification justification = justificationRepository.findById(justId)
                .orElseThrow(() -> new ResourceNotFoundException("Justification introuvable : " + justId));

        justification.setStatus(decision);
        justification.setReviewerComment(comment);

        // Si approuvée : mettre à jour le statut de l'enregistrement lié → EXCUSED
        if (decision == JustificationStatus.APPROVED && justification.getAttendanceRecord() != null) {
            AttendanceRecord record = justification.getAttendanceRecord();
            record.setStatus(AttendanceStatus.EXCUSED);
            recordRepository.save(record);
            log.info("Justification approuvée : enregistrement {} → EXCUSED", record.getId());
        }

        return toJustificationResponse(justificationRepository.save(justification));
    }

    // ─────────────────────── PRIVATE HELPERS ────────────────────────────────

    private void applyEntry(AttendanceRecord record, AttendanceEntryRequest entry) {
        record.setStatus(entry.status());
        if (entry.arrivalTime() != null) record.setArrivalTime(entry.arrivalTime());
        if (entry.lateMinutes() != null) record.setLateMinutes(entry.lateMinutes());
        if (entry.teacherNote() != null) record.setTeacherNote(entry.teacherNote());
        // Auto-déterminer lateMinutes si LATE et arrivalTime renseigné
        if (entry.status() == AttendanceStatus.LATE && entry.arrivalTime() != null
                && record.getSession().getStartAt() != null) {
            LocalTime sessionStart = record.getSession().getStartAt().toLocalTime();
            long deltaMinutes = java.time.Duration.between(
                    sessionStart, entry.arrivalTime()).toMinutes();
            if (deltaMinutes > 0) record.setLateMinutes((int) deltaMinutes);
        }
    }

    private AttendanceStatsResponse buildStats(Student student, Long courseId, String courseTitle,
                                                long total, long present) {
        double rate = total > 0 ? Math.round((present * 100.0 / total) * 100.0) / 100.0 : 100.0;
        boolean alert = rate < ALERT_THRESHOLD;
        String message = alert
                ? String.format("⚠️ Taux d'assiduité critique : %.1f%% (seuil: %.0f%%)", rate, ALERT_THRESHOLD)
                : null;

        long absent = total - present; // approximation (sans détail LATE/EXCUSED ici)
        return new AttendanceStatsResponse(
                student.getId(), student.getFirstName(), student.getLastName(), student.getStudentNumber(),
                courseId, courseTitle,
                total, present, absent, 0, 0,
                rate, alert, message
        );
    }

    private String storeFile(MultipartFile file, String subDir) {
        try {
            Path uploadPath = Paths.get(baseDir, subDir);
            Files.createDirectories(uploadPath);
            String uniqueName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), uploadPath.resolve(uniqueName), StandardCopyOption.REPLACE_EXISTING);
            return subDir + "/" + uniqueName;
        } catch (IOException e) {
            throw new FileStorageException("Erreur lors du stockage du justificatif : " + e.getMessage());
        }
    }

    private Session findSession(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session introuvable : " + id));
    }

    private Student findStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable : " + id));
    }

    // ─────────────────────── MAPPERS ────────────────────────────────────────

    private AttendanceRecordResponse toResponse(AttendanceRecord r) {
        return new AttendanceRecordResponse(
                r.getId(),
                r.getSession().getId(),
                r.getSession().getStartAt() != null ? r.getSession().getStartAt().toLocalDate() : null,
                r.getSession().getCourse() != null ? r.getSession().getCourse().getTitle() : null,
                r.getSession().getCourse() != null ? r.getSession().getCourse().getCode() : null,
                r.getStudent().getId(),
                r.getStudent().getFirstName(),
                r.getStudent().getLastName(),
                r.getStudent().getStudentNumber(),
                r.getStatus(),
                r.getArrivalTime(),
                r.getLateMinutes(),
                r.getTeacherNote(),
                r.getCreatedAt(),
                r.getCreatedBy()
        );
    }

    private JustificationResponse toJustificationResponse(AttendanceJustification j) {
        return new JustificationResponse(
                j.getId(),
                j.getStudent().getId(),
                j.getStudent().getFirstName(),
                j.getStudent().getLastName(),
                j.getStudent().getStudentNumber(),
                j.getAttendanceRecord() != null ? j.getAttendanceRecord().getId() : null,
                j.getReason(),
                j.getAbsenceDateFrom(),
                j.getAbsenceDateTo(),
                j.getDocumentName(),
                j.getDocumentPath(),
                j.getStatus(),
                j.getReviewerComment(),
                j.getCreatedAt(),
                j.getCreatedBy()
        );
    }
}
