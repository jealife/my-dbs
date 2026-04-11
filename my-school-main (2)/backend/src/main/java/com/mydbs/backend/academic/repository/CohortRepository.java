package com.mydbs.backend.academic.repository;

import com.mydbs.backend.academic.model.Cohort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CohortRepository extends JpaRepository<Cohort, Long> {

    boolean existsByCodeIgnoreCase(String code);

    List<Cohort> findByArchivedFalseOrderByNameAsc();
}