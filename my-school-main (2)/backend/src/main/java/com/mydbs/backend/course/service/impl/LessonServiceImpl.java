package com.mydbs.backend.course.service.impl;

import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.course.dto.LessonCreateRequest;
import com.mydbs.backend.course.dto.LessonResponse;
import com.mydbs.backend.course.dto.LessonUpdateRequest;
import com.mydbs.backend.course.model.CourseModule;
import com.mydbs.backend.course.model.Lesson;
import com.mydbs.backend.course.repository.CourseModuleRepository;
import com.mydbs.backend.course.repository.LessonRepository;
import com.mydbs.backend.course.service.LessonService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final CourseModuleRepository courseModuleRepository;

    public LessonServiceImpl(LessonRepository lessonRepository,
                             CourseModuleRepository courseModuleRepository) {
        this.lessonRepository = lessonRepository;
        this.courseModuleRepository = courseModuleRepository;
    }

    @Override
    public LessonResponse create(Long moduleId, LessonCreateRequest request) {
        CourseModule module = courseModuleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module de cours introuvable avec l'id : " + moduleId));

        Lesson lesson = new Lesson();
        lesson.setTitle(request.title());
        lesson.setSummary(request.summary());
        lesson.setContent(request.content());
        lesson.setDisplayOrder(request.displayOrder());
        lesson.setEstimatedMinutes(request.estimatedMinutes());
        lesson.setCourseModule(module);

        return map(lessonRepository.save(lesson));
    }

    @Override
    public List<LessonResponse> getByModule(Long moduleId) {
        return lessonRepository.findByCourseModuleIdAndArchivedFalseOrderByDisplayOrderAsc(moduleId)
                .stream().map(this::map).toList();
    }

    @Override
    public LessonResponse update(Long id, LessonUpdateRequest request) {
        Lesson lesson = findActive(id);
        lesson.setTitle(request.title());
        lesson.setSummary(request.summary());
        lesson.setContent(request.content());
        lesson.setDisplayOrder(request.displayOrder());
        lesson.setEstimatedMinutes(request.estimatedMinutes());

        return map(lessonRepository.save(lesson));
    }

    @Override
    public void archive(Long id) {
        Lesson lesson = findActive(id);
        lesson.setArchived(true);
        lessonRepository.save(lesson);
    }

    private Lesson findActive(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lecon introuvable avec l'id : " + id));
        if (lesson.isArchived()) {
            throw new ResourceNotFoundException("Lecon introuvable avec l'id : " + id);
        }
        return lesson;
    }

    private LessonResponse map(Lesson lesson) {
        return new LessonResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getSummary(),
                lesson.getContent(),
                lesson.getDisplayOrder(),
                lesson.getEstimatedMinutes(),
                lesson.getCourseModule().getId(),
                lesson.getCourseModule().getTitle(),
                lesson.getCreatedAt(),
                lesson.getUpdatedAt(),
                lesson.getCreatedBy(),
                lesson.getUpdatedBy()
        );
    }
}