package com.mydbs.backend.competence.repository;

import com.mydbs.backend.competence.model.Competence;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompetenceRepository extends JpaRepository<Competence, Long> {
    Optional<Competence> findByCodeAndArchivedFalse(String code);
    Page<Competence> findByProgramIdAndArchivedFalseOrderByDomainAscTitleAsc(Long programId, Pageable pageable);
    Page<Competence> findByDomainAndArchivedFalseOrderByTitleAsc(String domain, Pageable pageable);
    Page<Competence> findByArchivedFalseOrderByDomainAscTitleAsc(Pageable pageable);
}
