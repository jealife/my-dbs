package com.mydbs.backend.grades.repository;

import com.mydbs.backend.grades.model.Transcript;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TranscriptRepository extends JpaRepository<Transcript, Long> {
    List<Transcript> findByStudentIdAndArchivedFalseOrderByIssuedAtDesc(Long studentId);
    Optional<Transcript> findByReferenceNumberAndArchivedFalse(String referenceNumber);
}
