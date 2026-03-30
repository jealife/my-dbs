package com.mydbs.backend.course.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.ClassRoom;
import com.mydbs.backend.academic.model.Program;
import com.mydbs.backend.academic.repository.AcademicYearRepository;
import com.mydbs.backend.academic.repository.ClassRoomRepository;
import com.mydbs.backend.academic.repository.ProgramRepository;
import com.mydbs.backend.common.exception.DuplicateResourceException;
import com.mydbs.backend.common.exception.FileStorageException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.course.dto.CourseCreateRequest;
import com.mydbs.backend.course.dto.CoursePublishResponse;
import com.mydbs.backend.course.dto.CourseResponse;
import com.mydbs.backend.course.dto.CourseUpdateRequest;
import com.mydbs.backend.course.model.*;
import com.mydbs.backend.course.repository.CourseRepository;
import com.mydbs.backend.course.repository.CourseVersionRepository;
import com.mydbs.backend.course.service.CourseService;
import com.mydbs.backend.user.model.User;
import com.mydbs.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final CourseVersionRepository courseVersionRepository;
    private final AcademicYearRepository academicYearRepository;
    private final ProgramRepository programRepository;
    private final ClassRoomRepository classRoomRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public CourseServiceImpl(CourseRepository courseRepository,
                             CourseVersionRepository courseVersionRepository,
                             AcademicYearRepository academicYearRepository,
                             ProgramRepository programRepository,
                             ClassRoomRepository classRoomRepository,
                             UserRepository userRepository,
                             ObjectMapper objectMapper) {
        this.courseRepository = courseRepository;
        this.courseVersionRepository = courseVersionRepository;
        this.academicYearRepository = academicYearRepository;
        this.programRepository = programRepository;
        this.classRoomRepository = classRoomRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public CourseResponse create(CourseCreateRequest request) {
        if (courseRepository.existsByCodeIgnoreCase(request.code())) {
            throw new DuplicateResourceException("Un cours avec ce code existe deja");
        }

        Course course = new Course();
        applyCourseData(course, request.title(), request.code(), request.courseSheet(), request.objectives(),
                request.prerequisites(), request.syllabus(), request.description(), request.credits(),
                request.coefficient(), request.totalHours(), request.academicYearId(), request.programId(),
                request.classRoomId(), request.instructorUserId(),
                request.status() != null ? request.status() : CourseStatus.DRAFT,
                request.visibility() != null ? request.visibility() : CourseVisibility.INTERNAL);

        return map(courseRepository.save(course));
    }

    @Override
    public List<CourseResponse> getAll() {
        return courseRepository.findByArchivedFalseOrderByTitleAsc().stream().map(this::map).toList();
    }

    @Override
    public CourseResponse getById(Long id) {
        return map(findActive(id));
    }

    @Override
    public CourseResponse update(Long id, CourseUpdateRequest request) {
        Course course = findActive(id);

        courseRepository.findByCodeIgnoreCase(request.code())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new DuplicateResourceException("Un autre cours utilise deja ce code");
                    }
                });

        applyCourseData(course, request.title(), request.code(), request.courseSheet(), request.objectives(),
                request.prerequisites(), request.syllabus(), request.description(), request.credits(),
                request.coefficient(), request.totalHours(), request.academicYearId(), request.programId(),
                request.classRoomId(), request.instructorUserId(), request.status(), request.visibility());

        return map(courseRepository.save(course));
    }

    @Override
    public CoursePublishResponse publish(Long id) {
        Course course = findActive(id);

        if (course.getTitle() == null || course.getTitle().isBlank()) {
            throw new IllegalArgumentException("Le cours doit avoir un titre avant publication");
        }
        if (course.getObjectives() == null || course.getObjectives().isBlank()) {
            throw new IllegalArgumentException("Le cours doit avoir des objectifs avant publication");
        }
        if (course.getSyllabus() == null || course.getSyllabus().isBlank()) {
            throw new IllegalArgumentException("Le cours doit avoir un syllabus avant publication");
        }

        course.setPublished(true);
        course.setStatus(CourseStatus.PUBLISHED);

        CourseVersion version = new CourseVersion();
        version.setCourse(course);
        version.setVersionNumber(course.getCurrentVersionNumber());
        version.setVersionLabel("Publication v" + course.getCurrentVersionNumber());
        version.setPublishedSnapshot(true);
        version.setSnapshotJson(toJson(course));

        courseVersionRepository.save(version);
        course.setCurrentVersionNumber(course.getCurrentVersionNumber() + 1);
        courseRepository.save(course);

        return new CoursePublishResponse(course.getId(), course.getTitle(), version.getVersionNumber(), true,
                "Cours publie avec succes");
    }

    @Override
    public CoursePublishResponse unpublish(Long id) {
        Course course = findActive(id);
        course.setPublished(false);
        course.setStatus(CourseStatus.UNPUBLISHED);
        courseRepository.save(course);

        return new CoursePublishResponse(course.getId(), course.getTitle(), course.getCurrentVersionNumber(), false,
                "Cours de-publie avec succes");
    }

    @Override
    public void archive(Long id) {
        Course course = findActive(id);
        course.setArchived(true);
        course.setStatus(CourseStatus.ARCHIVED);
        courseRepository.save(course);
    }

    private void applyCourseData(Course course,
                                 String title,
                                 String code,
                                 String courseSheet,
                                 String objectives,
                                 String prerequisites,
                                 String syllabus,
                                 String description,
                                 Integer credits,
                                 Double coefficient,
                                 Integer totalHours,
                                 Long academicYearId,
                                 Long programId,
                                 Long classRoomId,
                                 Long instructorUserId,
                                 CourseStatus status,
                                 CourseVisibility visibility) {

        if (credits <= 0) {
            throw new IllegalArgumentException("Les credits doivent etre strictement positifs");
        }
        if (coefficient <= 0) {
            throw new IllegalArgumentException("Le coefficient doit etre strictement positif");
        }
        if (totalHours <= 0) {
            throw new IllegalArgumentException("Le volume horaire doit etre strictement positif");
        }

        AcademicYear academicYear = academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new ResourceNotFoundException("Annee academique introuvable avec l'id : " + academicYearId));

        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new ResourceNotFoundException("Programme introuvable avec l'id : " + programId));

        ClassRoom classRoom = null;
        if (classRoomId != null) {
            classRoom = classRoomRepository.findById(classRoomId)
                    .orElseThrow(() -> new ResourceNotFoundException("Classe introuvable avec l'id : " + classRoomId));
        }

        User instructor = null;
        if (instructorUserId != null) {
            instructor = userRepository.findById(instructorUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur instructeur introuvable avec l'id : " + instructorUserId));
        }

        course.setTitle(title);
        course.setCode(code);
        course.setCourseSheet(courseSheet);
        course.setObjectives(objectives);
        course.setPrerequisites(prerequisites);
        course.setSyllabus(syllabus);
        course.setDescription(description);
        course.setCredits(credits);
        course.setCoefficient(coefficient);
        course.setTotalHours(totalHours);
        course.setAcademicYear(academicYear);
        course.setProgram(program);
        course.setClassRoom(classRoom);
        course.setInstructor(instructor);
        course.setStatus(status);
        course.setVisibility(visibility);
    }

    private String toJson(Course course) {
        try {
            return objectMapper.writeValueAsString(map(course));
        } catch (JsonProcessingException ex) {
            throw new FileStorageException("Impossible de generer le snapshot de version", ex);
        }
    }

    private Course findActive(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable avec l'id : " + id));
        if (course.isArchived()) {
            throw new ResourceNotFoundException("Cours introuvable avec l'id : " + id);
        }
        return course;
    }

    private CourseResponse map(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getTitle(),
                course.getCode(),
                course.getCourseSheet(),
                course.getObjectives(),
                course.getPrerequisites(),
                course.getSyllabus(),
                course.getDescription(),
                course.getCredits(),
                course.getCoefficient(),
                course.getTotalHours(),
                course.isPublished(),
                course.getCurrentVersionNumber(),
                course.getStatus(),
                course.getVisibility(),
                course.getAcademicYear().getId(),
                course.getAcademicYear().getName(),
                course.getProgram().getId(),
                course.getProgram().getName(),
                course.getClassRoom() != null ? course.getClassRoom().getId() : null,
                course.getClassRoom() != null ? course.getClassRoom().getName() : null,
                course.getInstructor() != null ? course.getInstructor().getId() : null,
                course.getInstructor() != null ? course.getInstructor().getFirstName() + " " + course.getInstructor().getLastName() : null,
                course.getCreatedAt(),
                course.getUpdatedAt(),
                course.getCreatedBy(),
                course.getUpdatedBy()
        );
    }
}