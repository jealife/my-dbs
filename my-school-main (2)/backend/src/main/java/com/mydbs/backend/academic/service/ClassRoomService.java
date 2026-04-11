package com.mydbs.backend.academic.service;

import com.mydbs.backend.academic.dto.ClassRoomCreateRequest;
import com.mydbs.backend.academic.dto.ClassRoomResponse;
import com.mydbs.backend.academic.dto.ClassRoomUpdateRequest;

import java.util.List;

public interface ClassRoomService {

    ClassRoomResponse create(ClassRoomCreateRequest request);

    List<ClassRoomResponse> getAll();

    ClassRoomResponse getById(Long id);

    ClassRoomResponse update(Long id, ClassRoomUpdateRequest request);

    void archive(Long id);

    List<ClassRoomResponse> getByProgram(Long programId);

    List<ClassRoomResponse> getByAcademicYear(Long academicYearId);

    long getStudentCount(Long classRoomId);

    boolean isClassFull(Long classRoomId);

    boolean canEnrollStudent(Long classRoomId);

    /** Met à jour uniquement la capacité (réservé à l'admin). */
    ClassRoomResponse updateCapacity(Long id, int capacity);

    /** Met à jour la capacité de TOUTES les classes non archivées. */
    void updateAllCapacities(int capacity);

    /** Définit la capacité par défaut du système pour les nouvelles classes. */
    void setDefaultCapacity(int capacity);

    /** Récupère la capacité par défaut actuelle. */
    int getDefaultCapacity();

    /**
     * Recherche une classe disponible pour le programme et l'année académique donnés.
     * Si aucune n'existe ou si elles sont toutes pleines, en crée une nouvelle.
     */
    com.mydbs.backend.academic.model.ClassRoom getOrCreateAvailableClassRoom(
            com.mydbs.backend.academic.model.Program program,
            com.mydbs.backend.academic.model.AcademicYear academicYear,
            com.mydbs.backend.academic.model.Cohort cohort);
}
