package com.mydbs.backend.course.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mydbs.backend.academic.dto.ClassRoomResponse;
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
import com.mydbs.backend.ue.model.TeachingUnit;
import com.mydbs.backend.ue.repository.TeachingUnitRepository;
import com.mydbs.backend.user.model.User;
import com.mydbs.backend.user.repository.UserRepository;
import com.mydbs.backend.student.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final CourseVersionRepository courseVersionRepository;
    private final AcademicYearRepository academicYearRepository;
    private final ProgramRepository programRepository;
    private final ClassRoomRepository classRoomRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeachingUnitRepository teachingUnitRepository;
    private final ObjectMapper objectMapper;

    public CourseServiceImpl(CourseRepository courseRepository,
                             CourseVersionRepository courseVersionRepository,
                             AcademicYearRepository academicYearRepository,
                             ProgramRepository programRepository,
                             ClassRoomRepository classRoomRepository,
                             UserRepository userRepository,
                             StudentRepository studentRepository,
                             TeachingUnitRepository teachingUnitRepository,
                             ObjectMapper objectMapper) {
        this.courseRepository = courseRepository;
        this.courseVersionRepository = courseVersionRepository;
        this.academicYearRepository = academicYearRepository;
        this.programRepository = programRepository;
        this.classRoomRepository = classRoomRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teachingUnitRepository = teachingUnitRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public CourseResponse create(CourseCreateRequest request) {
        String code = request.code();
        if (code == null || code.isBlank()) {
            code = generateCourseCode(request.academicYearId());
        }

        if (courseRepository.existsByCodeIgnoreCase(code)) {
            throw new DuplicateResourceException("Un cours avec ce code existe déjà (" + code + ")");
        }

        Course course = new Course();
        applyCourseData(course, request.title(), code, request.courseSheet(), request.objectives(),
                request.prerequisites(), request.syllabus(), request.description(), request.credits(),
                request.totalHours(), request.academicYearId(), request.programId(),
                request.classRoomId(), request.instructorUserId(),
                request.status() != null ? request.status() : CourseStatus.DRAFT,
                request.visibility() != null ? request.visibility() : CourseVisibility.INTERNAL,
                request.semester(), request.teachingUnitId());

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
                request.totalHours(), request.academicYearId(), request.programId(),
                request.classRoomId(), request.instructorUserId(), request.status(), request.visibility(),
                request.semester(), request.teachingUnitId());

        return map(courseRepository.save(course));
    }

    @Override
    public CoursePublishResponse publish(Long id) {
        Course course = findActive(id);

        if (course.getTitle() == null || course.getTitle().isBlank()) {
            throw new IllegalArgumentException("Le cours doit avoir un titre avant publication");
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

    @Override
    public List<CourseResponse> getByInstructor(Long instructorId) {
        return courseRepository.findByInstructorIdAndArchivedFalseOrderByTitleAsc(instructorId)
                .stream().map(this::map).toList();
    }

    @Override
    public List<CourseResponse> getByClassRoom(Long classRoomId) {
        return courseRepository.findByClassRoomIdAndArchivedFalseOrderByTitleAsc(classRoomId)
                .stream().map(this::map).toList();
    }

    @Override
    public List<CourseResponse> getByProgram(Long programId) {
        return courseRepository.findByProgramIdAndArchivedFalseOrderByTitleAsc(programId)
                .stream().map(this::map).toList();
    }

    @Override
    public List<CourseResponse> getAccessibleCoursesForStudent(Long studentId) {
        com.mydbs.backend.student.model.Student student =
            studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Etudiant introuvable avec l'id : " + studentId));
        if (student.getClassRoom() == null) {
            return List.of();
        }
        return courseRepository
                .findByClassRoomIdAndPublishedTrueAndArchivedFalseOrderByTitleAsc(student.getClassRoom().getId())
                .stream().map(this::map).toList();
    }

    @Override
    public List<CourseResponse> getAccessibleCoursesByUserId(Long userId) {
        // Recherche via le userId du compte utilisateur (pas le studentId interne)
        return courseRepository.findPublishedCoursesByStudentUserId(userId)
                .stream().map(this::map).toList();
    }

    @Override
    public CourseResponse assignClassRoom(Long courseId, Long classRoomId) {
        Course course = findActive(courseId);
        if (classRoomId != null) {
            ClassRoom classRoom = classRoomRepository.findById(classRoomId)
                    .orElseThrow(() -> new ResourceNotFoundException("Classe introuvable avec l'id : " + classRoomId));
            course.setClassRoom(classRoom);
        } else {
            course.setClassRoom(null);
        }
        return map(courseRepository.save(course));
    }

    @Override
    public List<ClassRoomResponse> getAssignedClasses(Long courseId) {
        Course course = findActive(courseId);
        ClassRoom cr = course.getClassRoom();
        if (cr == null) return List.of();
        return List.of(mapClassRoom(cr));
    }

    @Override
    public CourseResponse assignClasses(Long courseId, List<Long> classIds) {
        if (classIds == null || classIds.isEmpty()) {
            return assignClassRoom(courseId, null);
        }
        return assignClassRoom(courseId, classIds.get(0));
    }

    private String generateCourseCode(Long academicYearId) {
        AcademicYear year = academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new ResourceNotFoundException("Année académique introuvable"));
        
        String yearPrefix = year.getName().split("-")[0].substring(Math.max(0, year.getName().split("-")[0].length() - 4));
        long count = courseRepository.countByAcademicYearId(academicYearId);
        
        return String.format("CRS-%s-%04d", yearPrefix, count + 1);
    }

    private ClassRoomResponse mapClassRoom(ClassRoom cr) {
        return new ClassRoomResponse(
                cr.getId(),
                cr.getName(),
                cr.getCode(),
                cr.getDescription(),
                cr.getCapacity(),
                cr.getDeliveryMode(),
                cr.getRoomLabel(),
                cr.getStatus(),
                cr.getAcademicYear() != null ? cr.getAcademicYear().getId() : null,
                cr.getAcademicYear() != null ? cr.getAcademicYear().getName() : null,
                cr.getProgram() != null ? cr.getProgram().getId() : null,
                cr.getProgram() != null ? cr.getProgram().getName() : null,
                cr.getCohort() != null ? cr.getCohort().getId() : null,
                cr.getCohort() != null ? cr.getCohort().getName() : null,
                null,
                cr.getCreatedAt(),
                cr.getUpdatedAt(),
                cr.getCreatedBy(),
                cr.getUpdatedBy()
        );
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
                                 Integer totalHours,
                                 Long academicYearId,
                                 Long programId,
                                 Long classRoomId,
                                 Long instructorUserId,
                                 CourseStatus status,
                                 CourseVisibility visibility,
                                 String semester,
                                 Long teachingUnitId) {

        if (credits <= 0) {
            throw new IllegalArgumentException("Les credits doivent etre strictement positifs");
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
        course.setTotalHours(totalHours);
        course.setAcademicYear(academicYear);
        course.setProgram(program);
        course.setClassRoom(classRoom);
        course.setInstructor(instructor);
        course.setStatus(status);
        course.setVisibility(visibility);
        course.setSemester(semester);

        if (teachingUnitId != null) {
            TeachingUnit ue = teachingUnitRepository.findById(teachingUnitId)
                    .orElseThrow(() -> new ResourceNotFoundException("UE introuvable : " + teachingUnitId));
            course.setTeachingUnit(ue);
        } else {
            course.setTeachingUnit(null);
        }
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
                course.getTotalHours(),
                course.isPublished(),
                course.getCurrentVersionNumber(),
                course.getStatus(),
                course.getVisibility(),
                course.getAcademicYear() != null ? course.getAcademicYear().getId() : null,
                course.getAcademicYear() != null ? course.getAcademicYear().getName() : null,
                course.getProgram() != null ? course.getProgram().getId() : null,
                course.getProgram() != null ? course.getProgram().getName() : null,
                course.getClassRoom() != null ? course.getClassRoom().getId() : null,
                course.getClassRoom() != null ? course.getClassRoom().getName() : null,
                course.getInstructor() != null ? course.getInstructor().getId() : null,
                course.getInstructor() != null ? course.getInstructor().getFirstName() + " " + course.getInstructor().getLastName() : null,
                course.getCreatedAt(),
                course.getUpdatedAt(),
                course.getCreatedBy(),
                course.getUpdatedBy(),
                course.getSemester(),
                course.getTeachingUnit() != null ? course.getTeachingUnit().getId() : null,
                course.getTeachingUnit() != null ? course.getTeachingUnit().getCode() : null,
                course.getTeachingUnit() != null ? course.getTeachingUnit().getName() : null
        );
    }
}