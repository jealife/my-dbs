package com.mydbs.backend.grades.service.impl;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.Cohort;
import com.mydbs.backend.academic.repository.AcademicYearRepository;
import com.mydbs.backend.academic.repository.CohortRepository;
import com.mydbs.backend.common.exception.DuplicateResourceException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.course.model.Course;
import com.mydbs.backend.course.repository.CourseRepository;
import com.mydbs.backend.grades.dto.*;
import com.mydbs.backend.grades.model.*;
import com.mydbs.backend.grades.repository.*;
import com.mydbs.backend.student.model.Student;
import com.mydbs.backend.student.repository.StudentRepository;
import com.mydbs.backend.email.EmailService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class GradesServiceImpl {

    private final GradeBookRepository gradeBookRepository;
    private final GradeItemRepository gradeItemRepository;
    private final BulletinRepository bulletinRepository;
    private final TranscriptRepository transcriptRepository;
    private final CreditAcquisitionRepository creditAcquisitionRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final AcademicYearRepository academicYearRepository;
    private final CohortRepository cohortRepository;
    private final EmailService emailService;

    public GradesServiceImpl(GradeBookRepository gradeBookRepository,
                              GradeItemRepository gradeItemRepository,
                              BulletinRepository bulletinRepository,
                              TranscriptRepository transcriptRepository,
                              CreditAcquisitionRepository creditAcquisitionRepository,
                              StudentRepository studentRepository,
                              CourseRepository courseRepository,
                              AcademicYearRepository academicYearRepository,
                              CohortRepository cohortRepository,
                              EmailService emailService) {
        this.gradeBookRepository = gradeBookRepository;
        this.gradeItemRepository = gradeItemRepository;
        this.bulletinRepository = bulletinRepository;
        this.transcriptRepository = transcriptRepository;
        this.creditAcquisitionRepository = creditAcquisitionRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.academicYearRepository = academicYearRepository;
        this.cohortRepository = cohortRepository;
        this.emailService = emailService;
    }

    // ─────────────────────── GRADE BOOKS ─────────────────────────────────

    public GradeBookResponse getOrCreateGradeBook(Long studentId, Long courseId, Long academicYearId,
                                                    Long cohortId, String semester) {
        Student student = findStudent(studentId);
        Course course = findCourse(courseId);
        AcademicYear year = findYear(academicYearId);
        Cohort cohort = cohortId != null ? findCohort(cohortId) : null;

        GradeBook gradeBook = gradeBookRepository
                .findByStudentIdAndCourseIdAndAcademicYearIdAndArchivedFalse(studentId, courseId, academicYearId)
                .orElseGet(() -> {
                    GradeBook gb = new GradeBook();
                    gb.setStudent(student);
                    gb.setCourse(course);
                    gb.setAcademicYear(year);
                    gb.setCohort(cohort);
                    gb.setSemester(semester);
                    gb.setCredits(course.getCredits());
                    return gradeBookRepository.save(gb);
                });

        List<GradeItem> items = gradeItemRepository.findByGradeBookIdAndArchivedFalseOrderByCreatedAtDesc(gradeBook.getId());
        return toGradeBookResponse(gradeBook, items);
    }

    @Transactional(readOnly = true)
    public List<GradeBookResponse> getStudentGradeBooks(Long studentId, Long academicYearId) {
        return gradeBookRepository.findByStudentIdAndAcademicYearIdAndArchivedFalseOrderByCourseTitle(
                        studentId, academicYearId)
                .stream().map(gb -> {
                    List<GradeItem> items = gradeItemRepository
                            .findByGradeBookIdAndArchivedFalseOrderByCreatedAtDesc(gb.getId());
                    return toGradeBookResponse(gb, items);
                }).toList();
    }

    public GradeBookResponse updateTeacherAppreciation(Long gradeBookId, String appreciation) {
        GradeBook gb = findGradeBook(gradeBookId);
        gb.setTeacherAppreciation(appreciation);
        gradeBookRepository.save(gb);
        List<GradeItem> items = gradeItemRepository.findByGradeBookIdAndArchivedFalseOrderByCreatedAtDesc(gb.getId());
        return toGradeBookResponse(gb, items);
    }

    // ─────────────────────── GRADE ITEMS ─────────────────────────────────

    public GradeItemResponse addGradeItem(GradeItemCreateRequest request) {
        GradeBook gradeBook = findGradeBook(request.gradeBookId());

        // Anti-doublon : même source ne peut pas être importée deux fois
        if (request.sourceId() != null &&
            gradeItemRepository.existsByGradeBookIdAndItemTypeAndSourceIdAndArchivedFalse(
                    gradeBook.getId(), request.itemType(), request.sourceId())) {
            throw new DuplicateResourceException("Cette note a déjà été importée dans ce carnet");
        }

        GradeItem item = new GradeItem();
        item.setGradeBook(gradeBook);
        item.setItemType(request.itemType());
        item.setSourceId(request.sourceId());
        item.setLabel(request.label());
        item.setScore(request.score());
        item.setMaxScore(request.maxScore() != null ? request.maxScore() : 20.0);
        item.setSemester(request.semester());
        item.setTeacherComment(request.teacherComment());

        GradeItem saved = gradeItemRepository.save(item);

        // Recalculer et mettre à jour la moyenne du GradeBook
        recalculateGradeBook(gradeBook);

        return toGradeItemResponse(saved);
    }

    public void deleteGradeItem(Long itemId) {
        GradeItem item = gradeItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Note introuvable : " + itemId));
        item.setArchived(true);
        gradeItemRepository.save(item);
        // Recalculer
        recalculateGradeBook(item.getGradeBook());
    }

    // ─────────────────────── BULLETINS ───────────────────────────────────

    /** Génère ou récupère un bulletin pour un étudiant/semestre/année */
    public BulletinResponse generateBulletin(Long studentId, Long academicYearId,
                                               Long cohortId, String semester) {
        Student student = findStudent(studentId);
        AcademicYear year = findYear(academicYearId);
        Cohort cohort = cohortId != null ? findCohort(cohortId) : null;

        Bulletin bulletin = bulletinRepository
                .findByStudentIdAndSemesterAndAcademicYearIdAndArchivedFalse(studentId, semester, academicYearId)
                .orElseGet(() -> {
                    Bulletin b = new Bulletin();
                    b.setStudent(student);
                    b.setAcademicYear(year);
                    b.setCohort(cohort);
                    b.setSemester(semester);
                    return b;
                });

        // Calculer la moyenne générale à partir des GradeBooks
        List<GradeBook> gradeBooks = gradeBookRepository
                .findByStudentIdAndAcademicYearIdAndSemesterAndArchivedFalse(studentId, academicYearId, semester);

        double numerator = 0.0, denominator = 0.0;
        int creditsAcquired = 0, creditsPossible = 0;

        for (GradeBook gb : gradeBooks) {
            if (gb.getWeightedAverage() != null && gb.getCredits() != null && gb.getCredits() > 0) {
                numerator += gb.getWeightedAverage() * gb.getCredits();
                denominator += gb.getCredits();
            } else if (gb.getWeightedAverage() != null) {
                numerator += gb.getWeightedAverage();
                denominator += 1.0;
            }
            if (gb.getCredits() != null) {
                creditsPossible += gb.getCredits();
                if (gb.isValidated()) creditsAcquired += gb.getCredits();
            }
        }

        if (denominator > 0) {
            double avg = Math.round((numerator / denominator) * 100.0) / 100.0;
            bulletin.setGeneralAverage(avg);
        }
        bulletin.setTotalCreditsAcquired(creditsAcquired);
        bulletin.setTotalCreditsPossible(creditsPossible);
        bulletin.setStatus(BulletinStatus.GENERATED);

        Bulletin saved = bulletinRepository.save(bulletin);

        // Stats cohorte (rang calculé si cohort est renseignée)
        computeCohortStats(saved, cohort, academicYearId, semester);

        List<GradeBook> gbs = gradeBookRepository
                .findByStudentIdAndAcademicYearIdAndArchivedFalseOrderByCourseTitle(studentId, academicYearId);
        return toBulletinResponse(saved, gbs);
    }

    public BulletinResponse publishBulletin(Long bulletinId, String comment) {
        Bulletin bulletin = findBulletin(bulletinId);
        bulletin.setStatus(BulletinStatus.PUBLISHED);
        bulletin.setHeadTeacherComment(comment);
        bulletin.setPublishedAt(LocalDateTime.now());
        bulletinRepository.save(bulletin);

        // M17 — Notification email à l'étudiant que son bulletin est disponible
        if (bulletin.getStudent() != null && bulletin.getStudent().getEmail() != null) {
            String studentName = bulletin.getStudent().getFirstName() + " " + bulletin.getStudent().getLastName();
            emailService.sendBulletinPublished(bulletin.getStudent().getEmail(), studentName,
                    bulletin.getSemester() != null ? bulletin.getSemester() : "S1");
        }

        List<GradeBook> gbs = gradeBookRepository
                .findByStudentIdAndAcademicYearIdAndArchivedFalseOrderByCourseTitle(
                        bulletin.getStudent().getId(), bulletin.getAcademicYear().getId());
        return toBulletinResponse(bulletin, gbs);
    }

    @Transactional(readOnly = true)
    public BulletinResponse getStudentBulletin(Long studentId, Long academicYearId, String semester) {
        Bulletin bulletin = bulletinRepository
                .findByStudentIdAndSemesterAndAcademicYearIdAndArchivedFalse(studentId, semester, academicYearId)
                .orElseThrow(() -> new ResourceNotFoundException("Bulletin introuvable pour cet étudiant"));
        List<GradeBook> gbs = gradeBookRepository
                .findByStudentIdAndAcademicYearIdAndArchivedFalseOrderByCourseTitle(studentId, academicYearId);
        return toBulletinResponse(bulletin, gbs);
    }

    @Transactional(readOnly = true)
    public Page<BulletinResponse> getCohortBulletins(Long cohortId, Long academicYearId,
                                                       String semester, Pageable pageable) {
        return bulletinRepository.findByCohortIdAndAcademicYearIdAndSemesterAndArchivedFalse(
                        cohortId, academicYearId, semester, pageable)
                .map(b -> {
                    List<GradeBook> gbs = gradeBookRepository
                            .findByStudentIdAndAcademicYearIdAndArchivedFalseOrderByCourseTitle(
                                    b.getStudent().getId(), academicYearId);
                    return toBulletinResponse(b, gbs);
                });
    }

    // ─────────────────────── CRÉDITS ECTS ────────────────────────────────

    public void recordCreditAcquisition(Long studentId, Long courseId, Long academicYearId,
                                         int credits, double grade, String semester) {
        Student student = findStudent(studentId);
        Course course = findCourse(courseId);
        AcademicYear year = findYear(academicYearId);

        CreditAcquisition credit = creditAcquisitionRepository
                .findByStudentIdAndCourseIdAndAcademicYearIdAndArchivedFalse(studentId, courseId, academicYearId)
                .orElseGet(CreditAcquisition::new);

        credit.setStudent(student);
        credit.setCourse(course);
        credit.setAcademicYear(year);
        credit.setCreditsEarned(credits);
        credit.setGradeObtained(grade);
        credit.setSemester(semester);
        creditAcquisitionRepository.save(credit);
    }

    // ─────────────────────── PRIVATE HELPERS ─────────────────────────────

    /**
     * Recalcule la moyenne d'un GradeBook (moyenne simple des notes ramenées sur 20).
     * Dans le système LMD, les crédits pondèrent les cours entre eux ; au sein d'un cours
     * toutes les évaluations ont le même poids.
     */
    private void recalculateGradeBook(GradeBook gradeBook) {
        List<GradeItem> items = gradeItemRepository
                .findByGradeBookIdAndArchivedFalseOrderByCreatedAtDesc(gradeBook.getId());

        double numerator = 0.0;
        int count = 0;
        for (GradeItem item : items) {
            if (item.getScore() != null && item.getMaxScore() != null && item.getMaxScore() > 0) {
                double scoreOn20 = (item.getScore() / item.getMaxScore()) * 20.0;
                numerator += scoreOn20;
                count++;
            }
        }

        if (count > 0) {
            double avg = Math.round((numerator / count) * 100.0) / 100.0;
            gradeBook.setWeightedAverage(avg);
            gradeBook.setValidated(avg >= (gradeBook.getPassingGrade() != null ? gradeBook.getPassingGrade() : 10.0));
        } else {
            gradeBook.setWeightedAverage(null);
            gradeBook.setValidated(false);
        }
        gradeBookRepository.save(gradeBook);
    }

    /** Calcule et stocke les stats de cohorte (rang, min, max, moyenne) pour un bulletin */
    private void computeCohortStats(Bulletin bulletin, Cohort cohort, Long yearId, String semester) {
        if (cohort == null) return;

        List<Bulletin> cohortBulletins = bulletinRepository
                .findForRankingByCohort(cohort.getId(), yearId, semester);

        if (cohortBulletins.isEmpty()) return;

        double classSum = 0.0, highest = Double.MIN_VALUE, lowest = Double.MAX_VALUE;
        int rank = 1;
        for (int i = 0; i < cohortBulletins.size(); i++) {
            Bulletin b = cohortBulletins.get(i);
            double avg = b.getGeneralAverage() != null ? b.getGeneralAverage() : 0.0;
            classSum += avg;
            if (avg > highest) highest = avg;
            if (avg < lowest) lowest = avg;
            if (b.getId().equals(bulletin.getId())) rank = i + 1;
        }

        bulletin.setRankInCohort(rank);
        bulletin.setTotalStudentsInCohort(cohortBulletins.size());
        bulletin.setClassAverage(Math.round((classSum / cohortBulletins.size()) * 100.0) / 100.0);
        bulletin.setHighestAverage(highest == Double.MIN_VALUE ? null : highest);
        bulletin.setLowestAverage(lowest == Double.MAX_VALUE ? null : lowest);
        bulletinRepository.save(bulletin);
    }

    // ─────────────────────── FINDERS ─────────────────────────────────────

    private Student findStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable : " + id));
    }
    private Course findCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable : " + id));
    }
    private AcademicYear findYear(Long id) {
        return academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Année académique introuvable : " + id));
    }
    private Cohort findCohort(Long id) {
        return cohortRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cohorte introuvable : " + id));
    }
    private GradeBook findGradeBook(Long id) {
        GradeBook gb = gradeBookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carnet introuvable : " + id));
        if (gb.isArchived()) throw new ResourceNotFoundException("Carnet introuvable : " + id);
        return gb;
    }
    private Bulletin findBulletin(Long id) {
        Bulletin b = bulletinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bulletin introuvable : " + id));
        if (b.isArchived()) throw new ResourceNotFoundException("Bulletin introuvable : " + id);
        return b;
    }

    // ─────────────────────── MAPPERS ─────────────────────────────────────

    private GradeItemResponse toGradeItemResponse(GradeItem item) {
        double maxScore = item.getMaxScore() != null && item.getMaxScore() > 0 ? item.getMaxScore() : 20.0;
        double scoreOn20 = Math.round((item.getScore() / maxScore) * 20.0 * 100.0) / 100.0;
        return new GradeItemResponse(
                item.getId(), item.getGradeBook().getId(), item.getItemType(), item.getSourceId(),
                item.getLabel(), item.getScore(), item.getMaxScore(),
                scoreOn20,
                item.getSemester(), item.getTeacherComment(), item.getCreatedAt()
        );
    }

    private GradeBookResponse toGradeBookResponse(GradeBook gb, List<GradeItem> items) {
        var ue = gb.getCourse() != null ? gb.getCourse().getTeachingUnit() : null;
        return new GradeBookResponse(
                gb.getId(),
                gb.getStudent().getId(), gb.getStudent().getFirstName(), gb.getStudent().getLastName(),
                gb.getStudent().getStudentNumber(),
                gb.getCourse().getId(), gb.getCourse().getTitle(), gb.getCourse().getCode(),
                gb.getCourse().getCredits(),
                gb.getAcademicYear().getId(), gb.getAcademicYear().getName(),
                gb.getSemester() != null ? gb.getSemester()
                        : (gb.getCourse().getSemester() != null ? gb.getCourse().getSemester() : null),
                gb.getWeightedAverage(), gb.getCredits(),
                gb.isValidated(), gb.getPassingGrade(), gb.getTeacherAppreciation(),
                items.stream().map(this::toGradeItemResponse).toList(),
                gb.getCreatedAt(),
                ue != null ? ue.getId() : null,
                ue != null ? ue.getCode() : null,
                ue != null ? ue.getName() : null
        );
    }

    private BulletinResponse toBulletinResponse(Bulletin b, List<GradeBook> gradeBooks) {
        List<GradeBookResponse> gbResponses = gradeBooks.stream()
                .map(gb -> {
                    List<GradeItem> items = gradeItemRepository
                            .findByGradeBookIdAndArchivedFalseOrderByCreatedAtDesc(gb.getId());
                    return toGradeBookResponse(gb, items);
                }).toList();

        // Groupement LMD par UE
        List<UeGradeGroupResponse> ueGroups = buildUeGroups(gbResponses);

        return new BulletinResponse(
                b.getId(),
                b.getStudent().getId(), b.getStudent().getFirstName(), b.getStudent().getLastName(),
                b.getStudent().getStudentNumber(),
                b.getAcademicYear().getId(), b.getAcademicYear().getName(),
                b.getCohort() != null ? b.getCohort().getId() : null,
                b.getCohort() != null ? b.getCohort().getName() : null,
                b.getSemester(), b.getStatus(), b.getGeneralAverage(),
                b.getTotalCreditsAcquired(), b.getTotalCreditsPossible(),
                b.getRankInCohort(), b.getTotalStudentsInCohort(),
                b.getClassAverage(), b.getHighestAverage(), b.getLowestAverage(),
                b.getHeadTeacherComment(), b.getCouncilDecision(), b.getPublishedAt(),
                gbResponses, ueGroups, b.getCreatedAt()
        );
    }

    /**
     * Regroupe les GradeBookResponse par UE.
     * Les cours sans UE sont regroupés sous un groupe "Sans UE".
     */
    private List<UeGradeGroupResponse> buildUeGroups(List<GradeBookResponse> gbResponses) {
        // LinkedHashMap pour préserver l'ordre UE
        Map<String, List<GradeBookResponse>> grouped = new LinkedHashMap<>();
        Map<String, String[]> ueMeta = new LinkedHashMap<>(); // key → [ueId, ueCode, ueName, semester, orderIndex]

        for (GradeBookResponse gb : gbResponses) {
            String key;
            if (gb.teachingUnitId() != null) {
                key = "ue_" + gb.teachingUnitId();
                ueMeta.put(key, new String[]{
                        String.valueOf(gb.teachingUnitId()),
                        gb.teachingUnitCode(),
                        gb.teachingUnitName(),
                        gb.semester() != null ? gb.semester() : "",
                        "1"
                });
            } else {
                key = "no_ue";
                ueMeta.put(key, new String[]{"0", "", "Sans UE", gb.semester() != null ? gb.semester() : "", "99"});
            }
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(gb);
        }

        List<UeGradeGroupResponse> groups = new ArrayList<>();
        for (Map.Entry<String, List<GradeBookResponse>> entry : grouped.entrySet()) {
            String[] meta = ueMeta.get(entry.getKey());
            Long ueId = Long.parseLong(meta[0]);
            groups.add(new UeGradeGroupResponse(
                    ueId == 0 ? null : ueId,
                    meta[1], meta[2], meta[3],
                    Integer.parseInt(meta[4]),
                    entry.getValue()
            ));
        }
        groups.sort(Comparator.comparingInt(UeGradeGroupResponse::ueOrderIndex));
        return groups;
    }
}
