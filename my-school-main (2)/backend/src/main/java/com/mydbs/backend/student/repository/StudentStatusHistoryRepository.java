package com.mydbs.backend.student.repository;

import com.mydbs.backend.student.model.StudentStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentStatusHistoryRepository extends JpaRepository<StudentStatusHistory, Long> {

    List<StudentStatusHistory> findByStudentIdOrderByCreatedAtDesc(Long studentId);
}