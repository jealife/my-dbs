package com.mydbs.backend.analytics.service.impl;

import com.mydbs.backend.analytics.model.AnalyticsSnapshot;
import com.mydbs.backend.analytics.model.RiskAlert;
import com.mydbs.backend.analytics.repository.AnalyticsSnapshotRepository;
import com.mydbs.backend.analytics.repository.RiskAlertRepository;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AnalyticsServiceImpl {


    private static final Logger log = LoggerFactory.getLogger(AnalyticsServiceImpl.class);

    // ── SEUILS DE RISQUE DE DÉCROCHAGE ────────────────────────────────────
    private static final double THRESHOLD_ATTENDANCE = 75.0;   // % assiduité
    private static final double THRESHOLD_GRADE = 8.0;         // /20
    private static final double THRESHOLD_COMPLETION = 50.0;   // % devoirs rendus

    private final AnalyticsSnapshotRepository snapshotRepository;
    private final RiskAlertRepository alertRepository;

    public AnalyticsServiceImpl(AnalyticsSnapshotRepository snapshotRepository,
                                 RiskAlertRepository alertRepository) {
        this.snapshotRepository = snapshotRepository;
        this.alertRepository = alertRepository;
    }

    // ─────────────────────── SNAPSHOTS ───────────────────────────────────

    /**
     * Crée ou met à jour un snapshot analytique pour un étudiant.
     * Calcule le score de risque de décrochage et déclenche des alertes si nécessaire.
     *
     * Score dropout (0–100) = moyenne pondérée :
     *   40% assiduité (inversé) + 40% note (inversée) + 20% completion (inversée)
     */
    public AnalyticsSnapshot computeStudentSnapshot(
            Long studentId, Long academicYearId, Long cohortId, Long programId,
            BigDecimal attendanceRate, BigDecimal averageGrade,
            BigDecimal assignmentCompletionRate, Integer ectsEarned,
            Integer lateSubmissions, Integer unjustifiedAbsences, Integer cohortRank) {

        // Calcul du score de risque (plus haut = plus risqué)
        double attendanceFactor = attendanceRate != null
                ? Math.max(0, 100 - attendanceRate.doubleValue()) / 100.0
                : 1.0;
        double gradeFactor = averageGrade != null
                ? Math.max(0, 20 - averageGrade.doubleValue()) / 20.0
                : 1.0;
        double completionFactor = assignmentCompletionRate != null
                ? Math.max(0, 100 - assignmentCompletionRate.doubleValue()) / 100.0
                : 1.0;

        double rawScore = (attendanceFactor * 0.4 + gradeFactor * 0.4 + completionFactor * 0.2) * 100.0;
        BigDecimal dropoutRiskScore = BigDecimal.valueOf(rawScore).setScale(2, RoundingMode.HALF_UP);

        // Récupérer ou créer le snapshot
        Optional<AnalyticsSnapshot> existing = snapshotRepository
                .findTopByStudentIdAndAcademicYearIdAndScopeOrderByCreatedAtDesc(studentId, academicYearId, "STUDENT");

        AnalyticsSnapshot snapshot = existing.orElseGet(AnalyticsSnapshot::new);
        snapshot.setScope("STUDENT");
        snapshot.setStudentId(studentId);
        snapshot.setAcademicYearId(academicYearId);
        snapshot.setCohortId(cohortId);
        snapshot.setProgramId(programId);
        snapshot.setAttendanceRate(attendanceRate);
        snapshot.setAverageGrade(averageGrade);
        snapshot.setAssignmentCompletionRate(assignmentCompletionRate);
        snapshot.setEctsEarned(ectsEarned);
        snapshot.setLateSubmissionsCount(lateSubmissions);
        snapshot.setUnjustifiedAbsencesCount(unjustifiedAbsences);
        snapshot.setCohortRank(cohortRank);
        snapshot.setDropoutRiskScore(dropoutRiskScore);

        AnalyticsSnapshot saved = snapshotRepository.save(snapshot);

        // Déclenchement d'alertes automatiques
        if (attendanceRate != null && attendanceRate.doubleValue() < THRESHOLD_ATTENDANCE) {
            triggerAlert(studentId, academicYearId, "LOW_ATTENDANCE",
                    THRESHOLD_ATTENDANCE, attendanceRate.doubleValue(),
                    String.format("Taux d'assiduité de %.1f%% inférieur au seuil de %.0f%%",
                            attendanceRate.doubleValue(), THRESHOLD_ATTENDANCE));
        }
        if (averageGrade != null && averageGrade.doubleValue() < THRESHOLD_GRADE) {
            triggerAlert(studentId, academicYearId, "LOW_GRADE",
                    THRESHOLD_GRADE, averageGrade.doubleValue(),
                    String.format("Moyenne de %.2f/20 inférieure au seuil de %.0f/20",
                            averageGrade.doubleValue(), THRESHOLD_GRADE));
        }
        if (rawScore > 60) {
            triggerAlert(studentId, academicYearId, "HIGH_DROPOUT_RISK",
                    60.0, rawScore,
                    String.format("Score de risque de décrochage élevé : %.1f/100", rawScore));
        }
        if (assignmentCompletionRate != null && assignmentCompletionRate.doubleValue() < THRESHOLD_COMPLETION) {
            triggerAlert(studentId, academicYearId, "MANY_LATE_SUBMISSIONS",
                    THRESHOLD_COMPLETION, assignmentCompletionRate.doubleValue(),
                    String.format("Taux de complétion des devoirs de %.1f%% inférieur au seuil de %.0f%%",
                            assignmentCompletionRate.doubleValue(), THRESHOLD_COMPLETION));
        }

        log.info("Snapshot calculé pour étudiant {} : dropout risk = {}", studentId, dropoutRiskScore);
        return saved;
    }

    @Transactional(readOnly = true)
    public Page<AnalyticsSnapshot> getStudentSnapshots(Long studentId, Pageable pageable) {
        return snapshotRepository.findByStudentIdAndArchivedFalseOrderByCreatedAtDesc(studentId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AnalyticsSnapshot> getCohortRiskRanking(Long cohortId, Pageable pageable) {
        return snapshotRepository.findByCohortIdAndArchivedFalseOrderByDropoutRiskScoreDesc(cohortId, pageable);
    }

    // ─────────────────────── ALERTES ─────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<RiskAlert> getAlertsByStatus(String status, Pageable pageable) {
        return alertRepository.findByStatusAndArchivedFalseOrderByCreatedAtDesc(status, pageable);
    }

    @Transactional(readOnly = true)
    public Page<RiskAlert> getStudentAlerts(Long studentId, Pageable pageable) {
        return alertRepository.findByStudentIdAndArchivedFalseOrderByCreatedAtDesc(studentId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<RiskAlert> getManagerAlerts(Long managerId, Pageable pageable) {
        return alertRepository.findByAssignedToIdAndStatusAndArchivedFalse(managerId, "OPEN", pageable);
    }

    @Transactional(readOnly = true)
    public long countOpenAlerts() {
        return alertRepository.countByStatusAndArchivedFalse("OPEN");
    }

    public RiskAlert acknowledgeAlert(Long alertId, Long assignedToId) {
        RiskAlert alert = findAlert(alertId);
        alert.setStatus("ACKNOWLEDGED");
        alert.setAssignedToId(assignedToId);
        return alertRepository.save(alert);
    }

    public RiskAlert resolveAlert(Long alertId) {
        RiskAlert alert = findAlert(alertId);
        alert.setStatus("RESOLVED");
        alert.setResolvedAt(LocalDateTime.now());
        return alertRepository.save(alert);
    }

    // ─────────────────────── PRIVATE ─────────────────────────────────────

    private void triggerAlert(Long studentId, Long academicYearId, String alertType,
                               double threshold, double observed, String message) {
        // Ne pas créer de doublon si une alerte OPEN identique existe déjà
        boolean alreadyOpen = alertRepository
                .findByStudentIdAndArchivedFalseOrderByCreatedAtDesc(studentId, Pageable.ofSize(20))
                .stream()
                .anyMatch(a -> alertType.equals(a.getAlertType()) && "OPEN".equals(a.getStatus()));
        if (alreadyOpen) return;

        RiskAlert alert = new RiskAlert();
        alert.setStudentId(studentId);
        alert.setAcademicYearId(academicYearId);
        alert.setAlertType(alertType);
        alert.setThresholdValue(threshold);
        alert.setObservedValue(observed);
        alert.setMessage(message);
        alertRepository.save(alert);
        log.warn("Alerte {} déclenchée pour étudiant {} : {}", alertType, studentId, message);
    }


    private RiskAlert findAlert(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerte introuvable : " + id));
    }

    // ─────────────────────── BATCH NOCTURNE (Module 16) ──────────────────
    /**
     * Recalcul automatique nocturne des snapshots analytiques.
     * Exécuté chaque nuit à 2h00 (cron = "0 0 2 * * *").
     * Récupère les derniers snapshots existants et les recalcule avec les mêmes paramètres.
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void nocturnalSnapshotBatch() {
        log.info("[BATCH] Début du recalcul nocturne des snapshots analytiques — {}", LocalDateTime.now());
        try {
            List<AnalyticsSnapshot> allSnapshots = snapshotRepository.findAll();
            int processed = 0;
            for (AnalyticsSnapshot snapshot : allSnapshots) {
                if (snapshot.getStudentId() == null || snapshot.getAcademicYearId() == null) continue;
                computeStudentSnapshot(
                        snapshot.getStudentId(),
                        snapshot.getAcademicYearId(),
                        snapshot.getCohortId(),
                        snapshot.getProgramId(),
                        snapshot.getAttendanceRate(),
                        snapshot.getAverageGrade(),
                        snapshot.getAssignmentCompletionRate(),
                        snapshot.getEctsEarned(),
                        snapshot.getLateSubmissionsCount(),
                        snapshot.getUnjustifiedAbsencesCount(),
                        snapshot.getCohortRank()
                );
                processed++;
            }
            log.info("[BATCH] Recalcul nocturne terminé : {} snapshots traités", processed);
        } catch (Exception e) {
            log.error("[BATCH] Erreur lors du recalcul nocturne : {}", e.getMessage(), e);
        }
    }
}
