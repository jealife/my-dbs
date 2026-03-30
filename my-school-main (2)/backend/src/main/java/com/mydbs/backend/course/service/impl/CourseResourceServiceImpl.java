package com.mydbs.backend.course.service.impl;

import com.mydbs.backend.common.exception.FileStorageException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.course.dto.CourseResourceResponse;
import com.mydbs.backend.course.model.*;
import com.mydbs.backend.course.repository.CourseModuleRepository;
import com.mydbs.backend.course.repository.CourseRepository;
import com.mydbs.backend.course.repository.CourseResourceRepository;
import com.mydbs.backend.course.repository.LessonRepository;
import com.mydbs.backend.course.service.CourseResourceService;
import com.mydbs.backend.course.service.FileStorageService;
import com.mydbs.backend.course.util.FileTypeUtils;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class CourseResourceServiceImpl implements CourseResourceService {

    private final CourseResourceRepository courseResourceRepository;
    private final CourseRepository courseRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final LessonRepository lessonRepository;
    private final FileStorageService fileStorageService;

    public CourseResourceServiceImpl(CourseResourceRepository courseResourceRepository,
                                     CourseRepository courseRepository,
                                     CourseModuleRepository courseModuleRepository,
                                     LessonRepository lessonRepository,
                                     FileStorageService fileStorageService) {
        this.courseResourceRepository = courseResourceRepository;
        this.courseRepository = courseRepository;
        this.courseModuleRepository = courseModuleRepository;
        this.lessonRepository = lessonRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public CourseResourceResponse upload(Long courseId,
                                         Long moduleId,
                                         Long lessonId,
                                         String title,
                                         String description,
                                         String visibility,
                                         MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("Aucun fichier n'a ete fourni");
        }

        Course course = getCourse(courseId);
        CourseModule module = getModule(moduleId);
        Lesson lesson = getLesson(lessonId);

        String originalName = file.getOriginalFilename();
        String extension = extractExtension(originalName);
        String contentType = file.getContentType();

        if (!FileTypeUtils.isSupported(contentType, extension)) {
            throw new FileStorageException("Type de fichier non supporte. Images, videos et documents courants uniquement");
        }

        FileStorageService.StoredFile stored = fileStorageService.store("courses/" + course.getId(), file);

        MediaCategory mediaCategory = FileTypeUtils.resolveCategory(contentType, extension);
        ResourceType resourceType = FileTypeUtils.resolveResourceType(mediaCategory);

        CourseResource resource = new CourseResource();
        resource.setTitle(title != null && !title.isBlank() ? title : stored.originalFileName());
        resource.setDescription(description);
        resource.setResourceType(resourceType);
        resource.setMediaCategory(mediaCategory);
        resource.setVisibility(parseVisibility(visibility));
        resource.setStoredFileName(stored.storedFileName());
        resource.setOriginalFileName(stored.originalFileName());
        resource.setFileExtension(stored.extension());
        resource.setContentType(stored.contentType());
        resource.setFileSize(stored.size());
        resource.setStoragePath(stored.storagePath());
        resource.setPublicUrl(stored.publicUrl());
        resource.setCourse(course);
        resource.setCourseModule(module);
        resource.setLesson(lesson);

        return map(courseResourceRepository.save(resource));
    }

    @Override
    public List<CourseResourceResponse> getByCourse(Long courseId) {
        return courseResourceRepository.findByCourseIdAndArchivedFalseOrderByCreatedAtDesc(courseId)
                .stream().map(this::map).toList();
    }

    @Override
    public Resource download(Long resourceId) {
        CourseResource resource = courseResourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Ressource introuvable avec l'id : " + resourceId));

        if (resource.isArchived()) {
            throw new ResourceNotFoundException("Ressource introuvable avec l'id : " + resourceId);
        }

        resource.setDownloadCount(resource.getDownloadCount() + 1);
        courseResourceRepository.save(resource);

        return fileStorageService.loadAsResource(resource.getStoragePath());
    }

    @Override
    public CourseResourceResponse createExternalLink(Long courseId,
                                                     Long moduleId,
                                                     Long lessonId,
                                                     String title,
                                                     String description,
                                                     String url,
                                                     boolean videoLink,
                                                     String visibility) {
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("L'URL externe est obligatoire");
        }

        Course course = getCourse(courseId);
        CourseModule module = getModule(moduleId);
        Lesson lesson = getLesson(lessonId);

        CourseResource resource = new CourseResource();
        resource.setTitle(title);
        resource.setDescription(description);
        resource.setExternalUrl(url);
        resource.setVisibility(parseVisibility(visibility));
        resource.setResourceType(videoLink ? ResourceType.VIDEO_LINK : ResourceType.EXTERNAL_LINK);
        resource.setMediaCategory(videoLink ? MediaCategory.VIDEO : MediaCategory.OTHER);
        resource.setCourse(course);
        resource.setCourseModule(module);
        resource.setLesson(lesson);

        return map(courseResourceRepository.save(resource));
    }

    @Override
    public void archive(Long id) {
        CourseResource resource = courseResourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ressource introuvable avec l'id : " + id));
        resource.setArchived(true);
        courseResourceRepository.save(resource);
    }

    @Override
    public Resource downloadByPath(String path) {
        return fileStorageService.loadAsResource(path);
    }

    private Course getCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable avec l'id : " + courseId));
    }

    private CourseModule getModule(Long moduleId) {
        if (moduleId == null) {
            return null;
        }
        return courseModuleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module introuvable avec l'id : " + moduleId));
    }

    private Lesson getLesson(Long lessonId) {
        if (lessonId == null) {
            return null;
        }
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lecon introuvable avec l'id : " + lessonId));
    }

    private String extractExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    }

    private ResourceVisibility parseVisibility(String visibility) {
        if (visibility == null || visibility.isBlank()) {
            return ResourceVisibility.COURSE_ONLY;
        }
        return ResourceVisibility.valueOf(visibility.toUpperCase());
    }

    private CourseResourceResponse map(CourseResource resource) {
        return new CourseResourceResponse(
                resource.getId(),
                resource.getTitle(),
                resource.getDescription(),
                resource.getResourceType(),
                resource.getMediaCategory(),
                resource.getVisibility(),
                resource.getExternalUrl(),
                resource.getStoredFileName(),
                resource.getOriginalFileName(),
                resource.getFileExtension(),
                resource.getContentType(),
                resource.getFileSize(),
                resource.getStoragePath(),
                resource.getPublicUrl(),
                resource.getDownloadCount(),
                resource.getCourse().getId(),
                resource.getCourse().getTitle(),
                resource.getCourseModule() != null ? resource.getCourseModule().getId() : null,
                resource.getCourseModule() != null ? resource.getCourseModule().getTitle() : null,
                resource.getLesson() != null ? resource.getLesson().getId() : null,
                resource.getLesson() != null ? resource.getLesson().getTitle() : null,
                resource.getCreatedAt(),
                resource.getUpdatedAt(),
                resource.getCreatedBy(),
                resource.getUpdatedBy()
        );
    }
}