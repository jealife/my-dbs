package com.mydbs.backend.course.repository;

import com.mydbs.backend.course.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findByCourseIdAndArchivedFalseOrderByStartAtAsc(Long courseId);
}