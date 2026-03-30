package com.mydbs.backend.career.repository;

import com.mydbs.backend.career.model.PortfolioProject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioProjectRepository extends JpaRepository<PortfolioProject, Long> {
    List<PortfolioProject> findByStudentIdAndArchivedFalseOrderByStartDateDesc(Long studentId);
    Page<PortfolioProject> findByPubliclyVisibleTrueAndArchivedFalseOrderByCreatedAtDesc(Pageable pageable);
}
