package com.mydbs.backend.student.repository;

import com.mydbs.backend.student.model.GuardianContact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuardianContactRepository extends JpaRepository<GuardianContact, Long> {

    List<GuardianContact> findByStudentIdAndArchivedFalseOrderByPrimaryContactDescCreatedAtAsc(Long studentId);

    void deleteByStudentId(Long studentId);
}