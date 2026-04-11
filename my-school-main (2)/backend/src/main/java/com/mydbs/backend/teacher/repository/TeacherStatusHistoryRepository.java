package com.mydbs.backend.teacher.repository;

import com.mydbs.backend.teacher.model.TeacherStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherStatusHistoryRepository extends JpaRepository<TeacherStatusHistory, Long> {

    List<TeacherStatusHistory> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);
}