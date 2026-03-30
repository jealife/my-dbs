package com.mydbs.backend.notification.repository;

import com.mydbs.backend.notification.model.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    @Query("SELECT a FROM Announcement a WHERE a.archived = false " +
           "AND (a.publishedAt IS NULL OR a.publishedAt <= :now) " +
           "AND (a.expiresAt IS NULL OR a.expiresAt > :now) " +
           "AND (a.audience = 'ALL' OR a.audience = :audience OR " +
           "     (a.audience = 'COHORT' AND a.cohortId = :cohortId)) " +
           "ORDER BY a.pinned DESC, a.publishedAt DESC")
    Page<Announcement> findActive(@Param("now") LocalDateTime now,
                                   @Param("audience") String audience,
                                   @Param("cohortId") Long cohortId,
                                   Pageable pageable);

    Page<Announcement> findByAuthorIdAndArchivedFalseOrderByCreatedAtDesc(Long authorId, Pageable pageable);
}
