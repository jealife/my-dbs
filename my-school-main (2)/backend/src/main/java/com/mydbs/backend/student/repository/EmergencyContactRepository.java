package com.mydbs.backend.student.repository;

import com.mydbs.backend.student.model.EmergencyContact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {

    List<EmergencyContact> findByStudentIdAndArchivedFalseOrderByPriorityOrderAsc(Long studentId);

    void deleteByStudentId(Long studentId);
}