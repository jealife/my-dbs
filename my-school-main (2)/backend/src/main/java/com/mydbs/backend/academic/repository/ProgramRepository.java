package com.mydbs.backend.academic.repository;

import com.mydbs.backend.academic.model.Program;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProgramRepository extends JpaRepository<Program, Long> {

    boolean existsByCodeIgnoreCase(String code);

    Optional<Program> findByCodeIgnoreCase(String code);

    List<Program> findByArchivedFalseOrderByNameAsc();
}