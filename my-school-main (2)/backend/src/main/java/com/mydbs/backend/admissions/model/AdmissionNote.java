package com.mydbs.backend.admissions.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "admission_notes",
        indexes = {
                @Index(name = "idx_admission_note_application", columnList = "application_id")
        })
public class AdmissionNote extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_admission_note_application"))
    private AdmissionApplication application;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "internal_only", nullable = false)
    private boolean internalOnly = true;

    public AdmissionApplication getApplication() { return application; }
    public void setApplication(AdmissionApplication application) { this.application = application; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isInternalOnly() { return internalOnly; }
    public void setInternalOnly(boolean internalOnly) { this.internalOnly = internalOnly; }
}
