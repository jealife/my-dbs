package com.mydbs.backend.course.service.impl;

import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.course.dto.CourseModuleCreateRequest;
import com.mydbs.backend.course.dto.CourseModuleResponse;
import com.mydbs.backend.course.dto.CourseModuleUpdateRequest;
import com.mydbs.backend.course.model.Course;
import com.mydbs.backend.course.model.CourseModule;
import com.mydbs.backend.course.repository.CourseModuleRepository;
import com.mydbs.backend.course.repository.CourseRepository;
import com.mydbs.backend.course.service.CourseModuleService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseModuleServiceImpl implements CourseModuleService {

    private final CourseModuleRepository courseModuleRepository;
    private final CourseRepository courseRepository;

    public CourseModuleServiceImpl(CourseModuleRepository courseModuleRepository,
                                   CourseRepository courseRepository) {
        this.courseModuleRepository = courseModuleRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public CourseModuleResponse create(Long courseId, CourseModuleCreateRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable avec l'id : " + courseId));

        CourseModule module = new CourseModule();
        module.setTitle(request.title());
        module.setDescription(request.description());
        module.setObjectives(request.objectives());
        module.setDisplayOrder(request.displayOrder());
        module.setEstimatedMinutes(request.estimatedMinutes());
        module.setCourse(course);

        return map(courseModuleRepository.save(module));
    }

    @Override
    public List<CourseModuleResponse> getByCourse(Long courseId) {
        return courseModuleRepository.findByCourseIdAndArchivedFalseOrderByDisplayOrderAsc(courseId)
                .stream().map(this::map).toList();
    }

    @Override
    public CourseModuleResponse update(Long id, CourseModuleUpdateRequest request) {
        CourseModule module = findActive(id);
        module.setTitle(request.title());
        module.setDescription(request.description());
        module.setObjectives(request.objectives());
        module.setDisplayOrder(request.displayOrder());
        module.setEstimatedMinutes(request.estimatedMinutes());

        return map(courseModuleRepository.save(module));
    }

    @Override
    public void archive(Long id) {
        CourseModule module = findActive(id);
        module.setArchived(true);
        courseModuleRepository.save(module);
    }

    private CourseModule findActive(Long id) {
        CourseModule module = courseModuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module de cours introuvable avec l'id : " + id));
        if (module.isArchived()) {
            throw new ResourceNotFoundException("Module de cours introuvable avec l'id : " + id);
        }
        return module;
    }

    private CourseModuleResponse map(CourseModule module) {
        return new CourseModuleResponse(
                module.getId(),
                module.getTitle(),
                module.getDescription(),
                module.getObjectives(),
                module.getDisplayOrder(),
                module.getEstimatedMinutes(),
                module.getCourse().getId(),
                module.getCourse().getTitle(),
                module.getCreatedAt(),
                module.getUpdatedAt(),
                module.getCreatedBy(),
                module.getUpdatedBy()
        );
    }
}