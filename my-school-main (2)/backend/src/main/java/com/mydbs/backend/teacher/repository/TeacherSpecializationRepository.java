package com.mydbs.backend.teacher.repository;

import com.mydbs.backend.teacher.model.TeacherSpecialization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherSpecializationRepository extends JpaRepository<TeacherSpecialization, Long> {

    List<TeacherSpecialization> findByTeacherIdAndArchivedFalseOrderByPrimarySpecializationDescCreatedAtAsc(Long teacherId);

    void deleteByTeacherId(Long teacherId);
}