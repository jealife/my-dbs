package com.mydbs.backend.documents.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

/**
 * DocumentVersion = une version d'un document géré dans la GED.
 * Permet le versionning complet : chaque upload crée une nouvelle version.
 */
@Entity
@Table(name = "document_versions",
        indexes = {
                @Index(name = "idx_docver_document", columnList = "document_id"),
                @Index(name = "idx_docver_current", columnList = "is_current")
        })
public class DocumentVersion extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_docver_document"))
    private ManagedDocument document;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "file_name", nullable = false, length = 300)
    private String fileName;

    @Column(name = "file_path", nullable = false, length = 1000)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "checksum", length = 100)
    private String checksum;   // SHA-256 pour vérification d'intégrité

    @Column(name = "is_current", nullable = false)
    private boolean isCurrent = true;

    @Column(name = "change_summary", length = 500)
    private String changeSummary;

    // Getters & Setters
    public ManagedDocument getDocument() { return document; }
    public void setDocument(ManagedDocument document) { this.document = document; }
    public Integer getVersionNumber() { return versionNumber; }
    public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
    public String getChecksum() { return checksum; }
    public void setChecksum(String checksum) { this.checksum = checksum; }
    public boolean isCurrent() { return isCurrent; }
    public void setCurrent(boolean current) { isCurrent = current; }
    public String getChangeSummary() { return changeSummary; }
    public void setChangeSummary(String changeSummary) { this.changeSummary = changeSummary; }
}
