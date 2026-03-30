package com.mydbs.backend.competence.repository;

import com.mydbs.backend.competence.model.Badge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    Page<Badge> findByArchivedFalseOrderByCategoryAscTitleAsc(Pageable pageable);
    Page<Badge> findByCategoryAndArchivedFalseOrderByPointsDesc(String category, Pageable pageable);
}
