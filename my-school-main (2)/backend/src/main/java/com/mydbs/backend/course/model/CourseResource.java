package com.mydbs.backend.course.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "course_resources",
        indexes = {
                @Index(name = "idx_course_resources_course", columnList = "course_id"),
                @Index(name = "idx_course_resources_module", columnList = "course_module_id"),
                @Index(name = "idx_course_resources_lesson", columnList = "lesson_id"),
                @Index(name = "idx_course_resources_category", columnList = "media_category")
        })
public class CourseResource extends BaseAuditEntity {

    @Column(name = "title", nullable = false, length = 180)
    private String title;

    @Column(name = "description", length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false, length = 30)
    private ResourceType resourceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_category", nullable = false, length = 30)
    private MediaCategory mediaCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 30)
    private ResourceVisibility visibility = ResourceVisibility.COURSE_ONLY;

    @Column(name = "external_url", length = 1000)
    private String externalUrl;

    @Column(name = "stored_file_name", length = 255)
    private String storedFileName;

    @Column(name = "original_file_name", length = 255)
    private String originalFileName;

    @Column(name = "file_extension", length = 30)
    private String fileExtension;

    @Column(name = "content_type", length = 150)
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "storage_path", length = 1000)
    private String storagePath;

    @Column(name = "public_url", length = 1000)
    private String publicUrl;

    @Column(name = "download_count", nullable = false)
    private Long downloadCount = 0L;

    @Column(name = "expires_at", length = 50)
    private String expiresAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_course_resource_course"))
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_module_id",
            foreignKey = @ForeignKey(name = "fk_course_resource_module"))
    private CourseModule courseModule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id",
            foreignKey = @ForeignKey(name = "fk_course_resource_lesson"))
    private Lesson lesson;

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public ResourceType getResourceType() {
        return resourceType;
    }

    public MediaCategory getMediaCategory() {
        return mediaCategory;
    }

    public ResourceVisibility getVisibility() {
        return visibility;
    }

    public String getExternalUrl() {
        return externalUrl;
    }

    public String getStoredFileName() {
        return storedFileName;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public String getFileExtension() {
        return fileExtension;
    }

    public String getContentType() {
        return contentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public String getPublicUrl() {
        return publicUrl;
    }

    public Long getDownloadCount() {
        return downloadCount;
    }

    public String getExpiresAt() {
        return expiresAt;
    }

    public Course getCourse() {
        return course;
    }

    public CourseModule getCourseModule() {
        return courseModule;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }

    public void setMediaCategory(MediaCategory mediaCategory) {
        this.mediaCategory = mediaCategory;
    }

    public void setVisibility(ResourceVisibility visibility) {
        this.visibility = visibility;
    }

    public void setExternalUrl(String externalUrl) {
        this.externalUrl = externalUrl;
    }

    public void setStoredFileName(String storedFileName) {
        this.storedFileName = storedFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public void setFileExtension(String fileExtension) {
        this.fileExtension = fileExtension;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }

    public void setPublicUrl(String publicUrl) {
        this.publicUrl = publicUrl;
    }

    public void setDownloadCount(Long downloadCount) {
        this.downloadCount = downloadCount;
    }

    public void setExpiresAt(String expiresAt) {
        this.expiresAt = expiresAt;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public void setCourseModule(CourseModule courseModule) {
        this.courseModule = courseModule;
    }

    public void setLesson(Lesson lesson) {
        this.lesson = lesson;
    }
}