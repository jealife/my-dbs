package com.mydbs.backend.mentoring.repository;

import com.mydbs.backend.mentoring.model.ActionPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActionPlanRepository extends JpaRepository<ActionPlan, Long> {
    List<ActionPlan> findByMentorshipIdAndArchivedFalseOrderByDueDateAsc(Long mentorshipId);
    List<ActionPlan> findByMentorshipIdAndCompletedFalseAndArchivedFalse(Long mentorshipId);
}
