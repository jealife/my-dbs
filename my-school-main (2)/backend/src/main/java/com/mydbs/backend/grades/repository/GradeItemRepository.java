package com.mydbs.backend.grades.repository;

import com.mydbs.backend.grades.model.GradeItem;
import com.mydbs.backend.grades.model.GradeItemType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GradeItemRepository extends JpaRepository<GradeItem, Long> {

    List<GradeItem> findByGradeBookIdAndArchivedFalseOrderByCreatedAtDesc(Long gradeBookId);

    List<GradeItem> findByGradeBookIdAndSemesterAndArchivedFalse(Long gradeBookId, String semester);

    boolean existsByGradeBookIdAndItemTypeAndSourceIdAndArchivedFalse(
            Long gradeBookId, GradeItemType itemType, Long sourceId);
}
