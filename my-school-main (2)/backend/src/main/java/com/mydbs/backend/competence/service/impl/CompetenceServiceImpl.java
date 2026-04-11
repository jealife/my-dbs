package com.mydbs.backend.competence.service.impl;

import com.mydbs.backend.common.exception.DuplicateResourceException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.competence.model.Badge;
import com.mydbs.backend.competence.model.BadgeAward;
import com.mydbs.backend.competence.model.Competence;
import com.mydbs.backend.competence.model.CompetenceAcquisition;
import com.mydbs.backend.competence.repository.BadgeAwardRepository;
import com.mydbs.backend.competence.repository.BadgeRepository;
import com.mydbs.backend.competence.repository.CompetenceAcquisitionRepository;
import com.mydbs.backend.competence.repository.CompetenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class CompetenceServiceImpl {

    private static final Logger log = LoggerFactory.getLogger(CompetenceServiceImpl.class);

    private final CompetenceRepository competenceRepository;
    private final CompetenceAcquisitionRepository acquisitionRepository;
    private final BadgeRepository badgeRepository;
    private final BadgeAwardRepository awardRepository;

    public CompetenceServiceImpl(CompetenceRepository competenceRepository,
                                  CompetenceAcquisitionRepository acquisitionRepository,
                                  BadgeRepository badgeRepository,
                                  BadgeAwardRepository awardRepository) {
        this.competenceRepository = competenceRepository;
        this.acquisitionRepository = acquisitionRepository;
        this.badgeRepository = badgeRepository;
        this.awardRepository = awardRepository;
    }

    // ── RÉFÉRENTIEL COMPÉTENCES ───────────────────────────────────────────────

    public Competence createCompetence(String code, String title, String description,
                                        String domain, String expectedLevel, Long programId) {
        competenceRepository.findByCodeAndArchivedFalse(code)
                .ifPresent(c -> { throw new DuplicateResourceException("Code déjà utilisé : " + code); });
        Competence c = new Competence();
        c.setCode(code); c.setTitle(title); c.setDescription(description);
        c.setDomain(domain); c.setExpectedLevel(expectedLevel); c.setProgramId(programId);
        return competenceRepository.save(c);
    }

    @Transactional(readOnly = true)
    public Page<Competence> getAllCompetences(Pageable pageable) {
        return competenceRepository.findByArchivedFalseOrderByDomainAscTitleAsc(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Competence> getCompetencesByProgram(Long programId, Pageable pageable) {
        return competenceRepository.findByProgramIdAndArchivedFalseOrderByDomainAscTitleAsc(programId, pageable);
    }

    public void deleteCompetence(Long id) {
        Competence c = findCompetence(id);
        c.setArchived(true);
        competenceRepository.save(c);
    }

    // ── ACQUISITIONS ─────────────────────────────────────────────────────────

    /**
     * Enregistre l'acquisition d'une compétence par un étudiant.
     * Déclenche l'attribution automatique de badges éligibles si autoAward=true.
     */
    public CompetenceAcquisition acquireCompetence(Long studentId, Long competenceId,
                                                    String acquiredLevel, Long validatedById,
                                                    String evidenceDescription) {
        if (acquisitionRepository.existsByStudentIdAndCompetenceIdAndArchivedFalse(studentId, competenceId)) {
            // Mise à jour du niveau si déjà acquis
            CompetenceAcquisition existing = acquisitionRepository
                    .findByStudentIdAndCompetenceIdAndArchivedFalse(studentId, competenceId)
                    .orElseThrow();
            existing.setAcquiredLevel(acquiredLevel);
            existing.setValidatedById(validatedById);
            existing.setValidatedAt(LocalDate.now());
            if (evidenceDescription != null) existing.setEvidenceDescription(evidenceDescription);
            existing = acquisitionRepository.save(existing);
            log.info("Compétence {} mise à jour pour étudiant {} → {}", competenceId, studentId, acquiredLevel);
            return existing;
        }

        Competence competence = findCompetence(competenceId);
        CompetenceAcquisition acquisition = new CompetenceAcquisition();
        acquisition.setStudentId(studentId);
        acquisition.setCompetence(competence);
        acquisition.setAcquiredLevel(acquiredLevel);
        acquisition.setValidatedById(validatedById);
        acquisition.setValidatedAt(LocalDate.now());
        acquisition.setEvidenceDescription(evidenceDescription);
        CompetenceAcquisition saved = acquisitionRepository.save(acquisition);
        log.info("Compétence {} acquise par étudiant {} au niveau {}", competenceId, studentId, acquiredLevel);

        // Attribution badges automatiques éligibles
        triggerAutoAwards(studentId);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<CompetenceAcquisition> getStudentPortfolio(Long studentId) {
        return acquisitionRepository.findByStudentIdAndArchivedFalseOrderByCompetenceTitleAsc(studentId);
    }

    // ── BADGES ───────────────────────────────────────────────────────────────

    public Badge createBadge(String title, String description, String iconUrl,
                              String category, int points, String awardCriteria, boolean autoAward) {
        Badge badge = new Badge();
        badge.setTitle(title); badge.setDescription(description); badge.setIconUrl(iconUrl);
        badge.setCategory(category); badge.setPoints(points);
        badge.setAwardCriteria(awardCriteria); badge.setAutoAward(autoAward);
        return badgeRepository.save(badge);
    }

    @Transactional(readOnly = true)
    public Page<Badge> getAllBadges(Pageable pageable) {
        return badgeRepository.findByArchivedFalseOrderByCategoryAscTitleAsc(pageable);
    }

    /** Attribution manuelle d'un badge à un étudiant */
    public BadgeAward awardBadge(Long studentId, Long badgeId, Long awardedById, String reason) {
        if (awardRepository.existsByStudentIdAndBadgeIdAndArchivedFalse(studentId, badgeId)) {
            throw new DuplicateResourceException("Badge déjà attribué à cet étudiant.");
        }
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Badge introuvable : " + badgeId));
        BadgeAward award = new BadgeAward();
        award.setStudentId(studentId);
        award.setBadge(badge);
        award.setAwardedAt(LocalDate.now());
        award.setAwardedById(awardedById);
        award.setAwardReason(reason);
        return awardRepository.save(award);
    }

    @Transactional(readOnly = true)
    public List<BadgeAward> getStudentBadges(Long studentId) {
        return awardRepository.findByStudentIdAndArchivedFalseOrderByAwardedAtDesc(studentId);
    }

    // ── PRIVATE ──────────────────────────────────────────────────────────────

    /** Attribution automatique des badges dont autoAward=true pour un étudiant */
    private void triggerAutoAwards(Long studentId) {
        List<CompetenceAcquisition> acquisitions = acquisitionRepository
                .findByStudentIdAndArchivedFalseOrderByCompetenceTitleAsc(studentId);

        // Exemple de règle auto : badge "Polyvalent" si ≥ 5 compétences acquises
        if (acquisitions.size() >= 5) {
            badgeRepository.findByCategoryAndArchivedFalseOrderByPointsDesc("Compétence", Pageable.ofSize(50))
                    .stream()
                    .filter(Badge::isAutoAward)
                    .forEach(badge -> {
                        if (!awardRepository.existsByStudentIdAndBadgeIdAndArchivedFalse(studentId, badge.getId())) {
                            BadgeAward auto = new BadgeAward();
                            auto.setStudentId(studentId);
                            auto.setBadge(badge);
                            auto.setAwardedAt(LocalDate.now());
                            auto.setAwardReason("Attribution automatique à " + acquisitions.size() + " compétences acquises");
                            awardRepository.save(auto);
                            log.info("Badge auto '{}' attribué à étudiant {}", badge.getTitle(), studentId);
                        }
                    });
        }
    }

    private Competence findCompetence(Long id) {
        return competenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compétence introuvable : " + id));
    }
}
