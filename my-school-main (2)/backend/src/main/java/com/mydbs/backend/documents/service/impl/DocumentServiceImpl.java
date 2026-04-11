package com.mydbs.backend.documents.service.impl;

import com.mydbs.backend.common.exception.FileStorageException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.documents.dto.DocumentAccessLogResponseDTO;
import com.mydbs.backend.documents.dto.ManagedDocumentResponseDTO;
import com.mydbs.backend.documents.model.*;
import com.mydbs.backend.documents.repository.*;
import com.mydbs.backend.user.dto.UserSummaryDTO;
import com.mydbs.backend.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DocumentServiceImpl {

    private static final Logger log = LoggerFactory.getLogger(DocumentServiceImpl.class);

    private final ManagedDocumentRepository documentRepository;
    private final DocumentVersionRepository versionRepository;
    private final DocumentAccessLogRepository accessLogRepository;
    private final UserRepository userRepository;

    @Value("${app.storage.local.base-dir:uploads}")
    private String baseDir;

    public DocumentServiceImpl(ManagedDocumentRepository documentRepository,
                                DocumentVersionRepository versionRepository,
                                DocumentAccessLogRepository accessLogRepository,
                                UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.versionRepository = versionRepository;
        this.accessLogRepository = accessLogRepository;
        this.userRepository = userRepository;
    }

    // ─────────────────────── CRÉATION DOCUMENT + UPLOAD ──────────────────

    public ManagedDocumentResponseDTO uploadDocument(MultipartFile file, Long ownerId, DocumentType type,
                                           AccessLevel accessLevel, String title, String description,
                                           String referenceType, Long referenceId,
                                           String tags, LocalDate expiryDate, Long academicYearId,
                                           String changeSummary) {
        // 1. Créer ou récupérer le document
        ManagedDocument doc = new ManagedDocument();
        doc.setOwnerId(ownerId);
        doc.setDocumentType(type);
        doc.setAccessLevel(accessLevel != null ? accessLevel : AccessLevel.MANAGER);
        doc.setTitle(title);
        doc.setDescription(description);
        doc.setReferenceType(referenceType);
        doc.setReferenceId(referenceId);
        doc.setTags(tags);
        doc.setExpiryDate(expiryDate);
        doc.setAcademicYearId(academicYearId);
        ManagedDocument savedDoc = documentRepository.save(doc);

        // 2. Stocker le fichier et créer la version
        DocumentVersion version = storeVersion(file, savedDoc, 1, changeSummary);
        savedDoc.setCurrentVersionId(version.getId());
        documentRepository.save(savedDoc);

        // 3. Journal d'accès
        logAccess(savedDoc, ownerId, "UPLOAD", version.getId(), null);
        return convertToResponseDTO(savedDoc);
    }

    /** Ajouter une nouvelle version à un document existant */
    public DocumentVersion addVersion(Long documentId, Long userId, MultipartFile file, String changeSummary) {
        ManagedDocument doc = findDocument(documentId);

        // Marquer l'ancienne version comme non-courante
        versionRepository.findByDocumentIdAndIsCurrentTrueAndArchivedFalse(documentId)
                .ifPresent(v -> { v.setCurrent(false); versionRepository.save(v); });

        int nextVersion = versionRepository.countByDocumentIdAndArchivedFalse(documentId) + 1;
        DocumentVersion version = storeVersion(file, doc, nextVersion, changeSummary);

        doc.setCurrentVersionId(version.getId());
        documentRepository.save(doc);

        logAccess(doc, userId, "UPLOAD", version.getId(), null);
        log.info("Nouvelle version {} du document {}", nextVersion, documentId);
        return version;
    }

    // ─────────────────────── CONSULTATION ────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ManagedDocumentResponseDTO> search(DocumentType type, Long ownerId, String keyword, Pageable pageable) {
        return documentRepository.search(type, ownerId, keyword, pageable)
                .map(this::convertToResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<ManagedDocumentResponseDTO> getByOwner(Long ownerId, Pageable pageable) {
        return documentRepository.findByOwnerIdAndArchivedFalseOrderByCreatedAtDesc(ownerId, pageable)
                .map(this::convertToResponseDTO);
    }

    @Transactional(readOnly = true)
    public List<ManagedDocumentResponseDTO> getByReference(String referenceType, Long referenceId) {
        return documentRepository.findByReferenceTypeAndReferenceIdAndArchivedFalse(referenceType, referenceId)
                .stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    @Transactional
    public List<DocumentVersion> getVersionHistory(Long documentId, Long userId) {
        ManagedDocument doc = findDocument(documentId);
        logAccess(doc, userId, "VIEW", null, null);
        return versionRepository.findByDocumentIdAndArchivedFalseOrderByVersionNumberDesc(documentId);
    }

    @Transactional
    public DocumentVersion getCurrentVersion(Long documentId, Long userId, String ipAddress) {
        ManagedDocument doc = findDocument(documentId);
        DocumentVersion version = versionRepository
                .findByDocumentIdAndIsCurrentTrueAndArchivedFalse(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune version active pour ce document"));
        logAccess(doc, userId, "DOWNLOAD", version.getId(), ipAddress);
        return version;
    }

    // ─────────────────────── SUPPRESSION ─────────────────────────────────

    public void deleteDocument(Long documentId, Long userId) {
        ManagedDocument doc = findDocument(documentId);
        doc.setArchived(true);
        documentRepository.save(doc);
        logAccess(doc, userId, "DELETE", null, null);
        log.info("Document {} archivé par l'utilisateur {}", documentId, userId);
    }

    // ─────────────────────── AUDIT LOG ───────────────────────────────────

    @Transactional(readOnly = true)
    public Page<DocumentAccessLogResponseDTO> getAuditLog(Long documentId, Pageable pageable) {
        return accessLogRepository.findByDocumentIdOrderByAccessedAtDesc(documentId, pageable)
                .map(this::convertToAuditResponseDTO);
    }

    // ─────────────────────── PRIVATE HELPERS ─────────────────────────────

    public ManagedDocumentResponseDTO convertToResponseDTO(ManagedDocument doc) {
        UserSummaryDTO owner = null;
        if (doc.getOwnerId() != null) {
            owner = userRepository.findById(doc.getOwnerId())
                    .map(UserSummaryDTO::fromEntity)
                    .orElse(null);
        }
        return ManagedDocumentResponseDTO.fromEntity(doc, owner);
    }

    private DocumentAccessLogResponseDTO convertToAuditResponseDTO(DocumentAccessLog log) {
        UserSummaryDTO user = null;
        if (log.getUserId() != null) {
            user = userRepository.findById(log.getUserId())
                    .map(UserSummaryDTO::fromEntity)
                    .orElse(null);
        }
        return new DocumentAccessLogResponseDTO(
                log.getId(),
                log.getAction(),
                log.getAccessedAt(),
                log.getIpAddress(),
                log.getVersionId(),
                user
        );
    }

    private DocumentVersion storeVersion(MultipartFile file, ManagedDocument doc,
                                          int versionNumber, String changeSummary) {
        try {
            String subDir = "documents/" + doc.getId();
            Path uploadPath = Paths.get(baseDir, subDir);
            Files.createDirectories(uploadPath);

            String uniqueName = UUID.randomUUID() + "_v" + versionNumber + "_" + file.getOriginalFilename();
            Path target = uploadPath.resolve(uniqueName);

            // Calcul checksum SHA-256 au moment de la copie
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (InputStream is = new DigestInputStream(file.getInputStream(), digest)) {
                Files.copy(is, target, StandardCopyOption.REPLACE_EXISTING);
            }
            String checksum = HexFormat.of().formatHex(digest.digest());

            DocumentVersion version = new DocumentVersion();
            version.setDocument(doc);
            version.setVersionNumber(versionNumber);
            version.setFileName(file.getOriginalFilename());
            version.setFilePath(subDir + "/" + uniqueName);
            version.setFileSize(file.getSize());
            version.setMimeType(file.getContentType());
            version.setChecksum(checksum);
            version.setCurrent(true);
            version.setChangeSummary(changeSummary);
            return versionRepository.save(version);

        } catch (IOException | NoSuchAlgorithmException e) {
            throw new FileStorageException("Erreur lors du stockage du fichier : " + e.getMessage());
        }
    }

    private void logAccess(ManagedDocument doc, Long userId, String action, Long versionId, String ipAddress) {
        DocumentAccessLog logEntry = new DocumentAccessLog();
        logEntry.setDocument(doc);
        logEntry.setUserId(userId);
        logEntry.setAction(action);
        logEntry.setAccessedAt(LocalDateTime.now());
        logEntry.setVersionId(versionId);
        logEntry.setIpAddress(ipAddress);
        accessLogRepository.save(logEntry);
    }

    private ManagedDocument findDocument(Long id) {
        ManagedDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable : " + id));
        if (doc.isArchived()) throw new ResourceNotFoundException("Document introuvable : " + id);
        return doc;
    }
}
