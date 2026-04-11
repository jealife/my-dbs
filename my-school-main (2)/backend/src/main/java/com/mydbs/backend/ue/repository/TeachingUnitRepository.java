package com.mydbs.backend.ue.repository;

import com.mydbs.backend.ue.model.TeachingUnit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeachingUnitRepository extends JpaRepository<TeachingUnit, Long> {

    List<TeachingUnit> findByProgramIdAndArchivedFalseOrderBySemesterAscOrderIndexAsc(Long programId);

    List<TeachingUnit> findByProgramIdAndSemesterAndArchivedFalseOrderByOrderIndexAsc(Long programId, String semester);

    List<TeachingUnit> findByArchivedFalseOrderByProgramIdAscSemesterAscOrderIndexAsc();
}
