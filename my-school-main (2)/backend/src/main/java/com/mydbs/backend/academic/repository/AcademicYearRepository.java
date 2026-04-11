package com.mydbs.backend.academic.repository;

import com.mydbs.backend.academic.model.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {

    boolean existsByCodeIgnoreCase(String code);

    Optional<AcademicYear> findByCodeIgnoreCase(String code);

    List<AcademicYear> findByArchivedFalseOrderByStartDateDesc();
}