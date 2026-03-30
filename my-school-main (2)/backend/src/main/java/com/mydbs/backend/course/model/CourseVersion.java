package com.mydbs.backend.course.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "course_versions",
        indexes = {
                @Index(name = "idx_course_versions_course", columnList = "course_id"),
                @Index(name = "idx_course_versions_number", columnList = "version_number")
        })
public class CourseVersion extends BaseAuditEntity {

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "version_label", nullable = false, length = 120)
    private String versionLabel;

    @Column(name = "published_snapshot", nullable = false)
    private boolean publishedSnapshot = false;

    @Lob
    @Column(name = "snapshot_json", nullable = false, columnDefinition = "LONGTEXT")
    private String snapshotJson;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_course_version_course"))
    private Course course;

    public Integer getVersionNumber() {
        return versionNumber;
    }

    public String getVersionLabel() {
        return versionLabel;
    }

    public boolean isPublishedSnapshot() {
        return publishedSnapshot;
    }

    public String getSnapshotJson() {
        return snapshotJson;
    }

    public Course getCourse() {
        return course;
    }

    public void setVersionNumber(Integer versionNumber) {
        this.versionNumber = versionNumber;
    }

    public void setVersionLabel(String versionLabel) {
        this.versionLabel = versionLabel;
    }

    public void setPublishedSnapshot(boolean publishedSnapshot) {
        this.publishedSnapshot = publishedSnapshot;
    }

    public void setSnapshotJson(String snapshotJson) {
        this.snapshotJson = snapshotJson;
    }

    public void setCourse(Course course) {
        this.course = course;
    }
}