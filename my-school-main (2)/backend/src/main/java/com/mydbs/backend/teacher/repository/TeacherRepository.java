package com.mydbs.backend.teacher.repository;

import com.mydbs.backend.teacher.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    boolean existsByTeacherNumberIgnoreCase(String teacherNumber);

    Optional<Teacher> findByTeacherNumberIgnoreCase(String teacherNumber);

    boolean existsByUserId(Long userId);

    Optional<Teacher> findByUserId(Long userId);

    List<Teacher> findByArchivedFalseOrderByLastNameAscFirstNameAsc();

    List<Teacher> findByProgramIdAndArchivedFalseOrderByLastNameAscFirstNameAsc(Long programId);
}