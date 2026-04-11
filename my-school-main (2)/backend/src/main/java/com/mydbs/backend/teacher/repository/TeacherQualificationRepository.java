package com.mydbs.backend.teacher.repository;

import com.mydbs.backend.teacher.model.TeacherQualification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherQualificationRepository extends JpaRepository<TeacherQualification, Long> {

    List<TeacherQualification> findByTeacherIdAndArchivedFalseOrderByYearAwardedDescCreatedAtAsc(Long teacherId);

    void deleteByTeacherId(Long teacherId);
}