package com.mydbs.backend.course.repository;

import com.mydbs.backend.course.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {

    boolean existsByCodeIgnoreCase(String code);

    Optional<Course> findByCodeIgnoreCase(String code);

    List<Course> findByArchivedFalseOrderByTitleAsc();

    List<Course> findByInstructorIdAndArchivedFalseOrderByTitleAsc(Long instructorId);

    List<Course> findByClassRoomIdAndArchivedFalseOrderByTitleAsc(Long classRoomId);

    // Cours publiés d'une classe (dashboard étudiant)
    List<Course> findByClassRoomIdAndPublishedTrueAndArchivedFalseOrderByTitleAsc(Long classRoomId);

    List<Course> findByProgramIdAndArchivedFalseOrderByTitleAsc(Long programId);
    
    long countByAcademicYearId(Long academicYearId);


    /**
     * Retourne les cours publiés accessibles à un étudiant identifié par son userId (User.id).
     * La jointure passe par Student.classRoom → Course.classRoom.
     */
    @Query("""
            SELECT c FROM Course c
            JOIN Student s ON s.classRoom.id = c.classRoom.id
            WHERE s.user.id = :userId
              AND s.archived = false
              AND c.archived = false
              AND c.published = true
            ORDER BY c.title ASC
            """)
    List<Course> findPublishedCoursesByStudentUserId(@Param("userId") Long userId);
}
