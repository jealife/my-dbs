package com.mydbs.backend.competence.repository;

import com.mydbs.backend.competence.model.CompetenceAcquisition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompetenceAcquisitionRepository extends JpaRepository<CompetenceAcquisition, Long> {
    List<CompetenceAcquisition> findByStudentIdAndArchivedFalseOrderByCompetenceTitleAsc(Long studentId);
    Optional<CompetenceAcquisition> findByStudentIdAndCompetenceIdAndArchivedFalse(Long studentId, Long competenceId);
    boolean existsByStudentIdAndCompetenceIdAndArchivedFalse(Long studentId, Long competenceId);
}
