package com.mydbs.backend.documents.repository;

import com.mydbs.backend.documents.model.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {
    List<DocumentVersion> findByDocumentIdAndArchivedFalseOrderByVersionNumberDesc(Long documentId);
    Optional<DocumentVersion> findByDocumentIdAndIsCurrentTrueAndArchivedFalse(Long documentId);
    int countByDocumentIdAndArchivedFalse(Long documentId);
}
