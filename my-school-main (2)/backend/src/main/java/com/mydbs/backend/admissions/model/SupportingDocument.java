package com.mydbs.backend.admissions.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "supporting_documents",
        indexes = {
                @Index(name = "idx_supporting_doc_application", columnList = "application_id"),
                @Index(name = "idx_supporting_doc_type", columnList = "document_type")
        })
public class SupportingDocument extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_supporting_doc_application"))
    private AdmissionApplication application;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 30)
    private DocumentType documentType;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "storage_path", nullable = false, length = 1000)
    private String storagePath;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "verified", nullable = false)
    private boolean verified = false;

    @Column(name = "verification_note", length = 500)
    private String verificationNote;

    public AdmissionApplication getApplication() { return application; }
    public void setApplication(AdmissionApplication application) { this.application = application; }

    public DocumentType getDocumentType() { return documentType; }
    public void setDocumentType(DocumentType documentType) { this.documentType = documentType; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public String getVerificationNote() { return verificationNote; }
    public void setVerificationNote(String verificationNote) { this.verificationNote = verificationNote; }
}
