package com.mydbs.backend.documents.repository;

import com.mydbs.backend.documents.model.AccessLevel;
import com.mydbs.backend.documents.model.DocumentType;
import com.mydbs.backend.documents.model.ManagedDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ManagedDocumentRepository extends JpaRepository<ManagedDocument, Long> {

    Page<ManagedDocument> findByOwnerIdAndArchivedFalseOrderByCreatedAtDesc(Long ownerId, Pageable pageable);

    Page<ManagedDocument> findByDocumentTypeAndArchivedFalse(DocumentType type, Pageable pageable);

    List<ManagedDocument> findByReferenceTypeAndReferenceIdAndArchivedFalse(String refType, Long refId);

    @Query("SELECT d FROM ManagedDocument d WHERE d.archived = false " +
           "AND (:type IS NULL OR d.documentType = :type) " +
           "AND (:ownerId IS NULL OR d.ownerId = :ownerId) " +
           "AND (:keyword IS NULL OR LOWER(d.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(d.tags) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<ManagedDocument> search(@Param("type") DocumentType type,
                                  @Param("ownerId") Long ownerId,
                                  @Param("keyword") String keyword,
                                  Pageable pageable);
}
