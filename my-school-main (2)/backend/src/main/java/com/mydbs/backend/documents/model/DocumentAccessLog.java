package com.mydbs.backend.documents.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * DocumentAccessLog = journal des accès et téléchargements de documents.
 * Permet l'audit complet des consultations.
 */
@Entity
@Table(name = "document_access_logs",
        indexes = {
                @Index(name = "idx_accesslog_doc", columnList = "document_id"),
                @Index(name = "idx_accesslog_user", columnList = "user_id"),
                @Index(name = "idx_accesslog_date", columnList = "accessed_at")
        })
public class DocumentAccessLog extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_accesslog_doc"))
    private ManagedDocument document;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "action", nullable = false, length = 30)
    private String action;    // VIEW | DOWNLOAD | UPLOAD | DELETE

    @Column(name = "accessed_at", nullable = false)
    private LocalDateTime accessedAt;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "version_id")
    private Long versionId;

    // Getters & Setters
    public ManagedDocument getDocument() { return document; }
    public void setDocument(ManagedDocument document) { this.document = document; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public LocalDateTime getAccessedAt() { return accessedAt; }
    public void setAccessedAt(LocalDateTime accessedAt) { this.accessedAt = accessedAt; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public Long getVersionId() { return versionId; }
    public void setVersionId(Long versionId) { this.versionId = versionId; }
}
