package com.mydbs.backend.admissions.repository;

import com.mydbs.backend.admissions.model.SupportingDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportingDocumentRepository extends JpaRepository<SupportingDocument, Long> {

    List<SupportingDocument> findByApplicationIdAndArchivedFalseOrderByCreatedAtAsc(Long applicationId);
}
