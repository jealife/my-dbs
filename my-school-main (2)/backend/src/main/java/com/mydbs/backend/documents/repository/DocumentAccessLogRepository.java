package com.mydbs.backend.documents.repository;

import com.mydbs.backend.documents.model.DocumentAccessLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentAccessLogRepository extends JpaRepository<DocumentAccessLog, Long> {
    Page<DocumentAccessLog> findByDocumentIdOrderByAccessedAtDesc(Long documentId, Pageable pageable);
    Page<DocumentAccessLog> findByUserIdOrderByAccessedAtDesc(Long userId, Pageable pageable);
}
