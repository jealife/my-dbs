package com.mydbs.backend.course.service;

import com.mydbs.backend.academic.dto.ClassRoomResponse;
import com.mydbs.backend.course.dto.CourseCreateRequest;
import com.mydbs.backend.course.dto.CoursePublishResponse;
import com.mydbs.backend.course.dto.CourseResponse;
import com.mydbs.backend.course.dto.CourseUpdateRequest;

import java.util.List;

public interface CourseService {

    CourseResponse create(CourseCreateRequest request);

    List<CourseResponse> getAll();

    CourseResponse getById(Long id);

    CourseResponse update(Long id, CourseUpdateRequest request);

    CoursePublishResponse publish(Long id);

    CoursePublishResponse unpublish(Long id);

    void archive(Long id);

    List<CourseResponse> getByInstructor(Long instructorId);

    List<CourseResponse> getByClassRoom(Long classRoomId);

    List<CourseResponse> getByProgram(Long programId);

    List<CourseResponse> getAccessibleCoursesForStudent(Long studentId);

    /**
     * Retourne les cours publiés accessibles à un utilisateur (par User.id).
     * Utilisé par le frontend qui connaît le userId du JWT, pas le studentId interne.
     */
    List<CourseResponse> getAccessibleCoursesByUserId(Long userId);

    /**
     * Associe (ou dissocie si classRoomId=null) une classe à un cours.
     * Appelé par un professeur ou un responsable pédagogique.
     */
    CourseResponse assignClassRoom(Long courseId, Long classRoomId);

    /** Retourne la liste des classes assignées au cours (0 ou 1 élément). */
    List<ClassRoomResponse> getAssignedClasses(Long courseId);

    /** Assigne plusieurs classes à un cours (le modèle supporte 1 classe — la première est retenue). */
    CourseResponse assignClasses(Long courseId, List<Long> classIds);
}
