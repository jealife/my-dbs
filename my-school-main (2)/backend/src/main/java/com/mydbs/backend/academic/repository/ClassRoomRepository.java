package com.mydbs.backend.academic.repository;

import com.mydbs.backend.academic.model.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClassRoomRepository extends JpaRepository<ClassRoom, Long> {

    boolean existsByCodeIgnoreCase(String code);

    List<ClassRoom> findByArchivedFalseOrderByNameAsc();

    List<ClassRoom> findByProgramIdAndArchivedFalseOrderByNameAsc(Long programId);

    List<ClassRoom> findByAcademicYearIdAndArchivedFalseOrderByNameAsc(Long academicYearId);

    Optional<ClassRoom> findByCodeAndArchivedFalse(String code);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.classRoom.id = :classRoomId AND s.archived = false")
    long countStudentsByClassRoomId(@Param("classRoomId") Long classRoomId);

    @Query("SELECT c FROM ClassRoom c WHERE c.program.id = :programId AND c.academicYear.id = :academicYearId AND c.archived = false ORDER BY c.name ASC")
    List<ClassRoom> findByProgramAndAcademicYear(@Param("programId") Long programId, @Param("academicYearId") Long academicYearId);

}
