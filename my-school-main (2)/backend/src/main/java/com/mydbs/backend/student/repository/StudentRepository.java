package com.mydbs.backend.student.repository;

import com.mydbs.backend.student.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByStudentNumberIgnoreCase(String studentNumber);

    Optional<Student> findByStudentNumberIgnoreCase(String studentNumber);

    boolean existsByUserId(Long userId);

    Optional<Student> findByUserId(Long userId);

    List<Student> findByArchivedFalseOrderByLastNameAscFirstNameAsc();

    List<Student> findByClassRoomIdAndArchivedFalseOrderByLastNameAscFirstNameAsc(Long classRoomId);

    List<Student> findByProgramIdAndArchivedFalseOrderByLastNameAscFirstNameAsc(Long programId);

    List<Student> findByAcademicYearIdAndArchivedFalseOrderByLastNameAscFirstNameAsc(Long academicYearId);
}