package com.mydbs.backend.admissions.repository;

import com.mydbs.backend.admissions.model.AdmissionNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdmissionNoteRepository extends JpaRepository<AdmissionNote, Long> {

    List<AdmissionNote> findByApplicationIdAndArchivedFalseOrderByCreatedAtDesc(Long applicationId);

    List<AdmissionNote> findByApplicationIdAndInternalOnlyFalseAndArchivedFalseOrderByCreatedAtDesc(Long applicationId);
}
