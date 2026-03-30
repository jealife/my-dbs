package com.mydbs.backend.mentoring.repository;

import com.mydbs.backend.mentoring.model.MentoringSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MentoringSessionRepository extends JpaRepository<MentoringSession, Long> {
    List<MentoringSession> findByMentorshipIdAndArchivedFalseOrderBySessionDateDesc(Long mentorshipId);
}
