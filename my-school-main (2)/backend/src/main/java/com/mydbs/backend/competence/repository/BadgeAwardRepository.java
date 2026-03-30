package com.mydbs.backend.competence.repository;

import com.mydbs.backend.competence.model.BadgeAward;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BadgeAwardRepository extends JpaRepository<BadgeAward, Long> {
    List<BadgeAward> findByStudentIdAndArchivedFalseOrderByAwardedAtDesc(Long studentId);
    boolean existsByStudentIdAndBadgeIdAndArchivedFalse(Long studentId, Long badgeId);
}
