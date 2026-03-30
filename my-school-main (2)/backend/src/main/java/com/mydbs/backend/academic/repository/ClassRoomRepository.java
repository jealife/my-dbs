package com.mydbs.backend.academic.repository;

import com.mydbs.backend.academic.model.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassRoomRepository extends JpaRepository<ClassRoom, Long> {

    boolean existsByCodeIgnoreCase(String code);

    List<ClassRoom> findByArchivedFalseOrderByNameAsc();
}