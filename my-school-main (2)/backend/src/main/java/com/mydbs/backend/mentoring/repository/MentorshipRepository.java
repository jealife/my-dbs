package com.mydbs.backend.mentoring.repository;

import com.mydbs.backend.mentoring.model.Mentorship;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MentorshipRepository extends JpaRepository<Mentorship, Long> {
    Page<Mentorship> findByMenteeIdAndArchivedFalseOrderByCreatedAtDesc(Long menteeId, Pageable pageable);
    Page<Mentorship> findByMentorIdAndArchivedFalseOrderByCreatedAtDesc(Long mentorId, Pageable pageable);
    List<Mentorship> findByStatusAndArchivedFalse(String status);
}
