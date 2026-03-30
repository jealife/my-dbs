package com.mydbs.backend.academic.service.impl;

import com.mydbs.backend.academic.dto.ClassRoomCreateRequest;
import com.mydbs.backend.academic.dto.ClassRoomResponse;
import com.mydbs.backend.academic.dto.ClassRoomUpdateRequest;
import com.mydbs.backend.academic.model.*;
import com.mydbs.backend.academic.repository.AcademicYearRepository;
import com.mydbs.backend.academic.repository.ClassRoomRepository;
import com.mydbs.backend.academic.repository.CohortRepository;
import com.mydbs.backend.academic.repository.ProgramRepository;
import com.mydbs.backend.academic.service.ClassRoomService;
import com.mydbs.backend.common.exception.DuplicateResourceException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClassRoomServiceImpl implements ClassRoomService {

    private final ClassRoomRepository classRoomRepository;
    private final AcademicYearRepository academicYearRepository;
    private final ProgramRepository programRepository;
    private final CohortRepository cohortRepository;

    public ClassRoomServiceImpl(ClassRoomRepository classRoomRepository,
                                AcademicYearRepository academicYearRepository,
                                ProgramRepository programRepository,
                                CohortRepository cohortRepository) {
        this.classRoomRepository = classRoomRepository;
        this.academicYearRepository = academicYearRepository;
        this.programRepository = programRepository;
        this.cohortRepository = cohortRepository;
    }

    @Override
    public ClassRoomResponse create(ClassRoomCreateRequest request) {
        if (classRoomRepository.existsByCodeIgnoreCase(request.code())) {
            throw new DuplicateResourceException("Une classe avec ce code existe deja");
        }

        AcademicYear academicYear = academicYearRepository.findById(request.academicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Annee academique introuvable avec l'id : " + request.academicYearId()));

        Program program = programRepository.findById(request.programId())
                .orElseThrow(() -> new ResourceNotFoundException("Programme introuvable avec l'id : " + request.programId()));

        Cohort cohort = null;
        if (request.cohortId() != null) {
            cohort = cohortRepository.findById(request.cohortId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cohorte introuvable avec l'id : " + request.cohortId()));
        }

        ClassRoom classRoom = new ClassRoom();
        classRoom.setName(request.name());
        classRoom.setCode(request.code());
        classRoom.setDescription(request.description());
        classRoom.setCapacity(request.capacity());
        classRoom.setDeliveryMode(request.deliveryMode());
        classRoom.setRoomLabel(request.roomLabel());
        classRoom.setAcademicYear(academicYear);
        classRoom.setProgram(program);
        classRoom.setCohort(cohort);
        classRoom.setStatus(request.status() != null ? request.status() : ClassRoomStatus.PLANNED);

        return map(classRoomRepository.save(classRoom));
    }

    @Override
    public List<ClassRoomResponse> getAll() {
        return classRoomRepository.findByArchivedFalseOrderByNameAsc()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public ClassRoomResponse getById(Long id) {
        return map(findActive(id));
    }

    @Override
    public ClassRoomResponse update(Long id, ClassRoomUpdateRequest request) {
        ClassRoom classRoom = findActive(id);

        if (!classRoom.getCode().equalsIgnoreCase(request.code()) && classRoomRepository.existsByCodeIgnoreCase(request.code())) {
            throw new DuplicateResourceException("Une autre classe utilise deja ce code");
        }

        AcademicYear academicYear = academicYearRepository.findById(request.academicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Annee academique introuvable avec l'id : " + request.academicYearId()));

        Program program = programRepository.findById(request.programId())
                .orElseThrow(() -> new ResourceNotFoundException("Programme introuvable avec l'id : " + request.programId()));

        Cohort cohort = null;
        if (request.cohortId() != null) {
            cohort = cohortRepository.findById(request.cohortId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cohorte introuvable avec l'id : " + request.cohortId()));
        }

        classRoom.setName(request.name());
        classRoom.setCode(request.code());
        classRoom.setDescription(request.description());
        classRoom.setCapacity(request.capacity());
        classRoom.setDeliveryMode(request.deliveryMode());
        classRoom.setRoomLabel(request.roomLabel());
        classRoom.setAcademicYear(academicYear);
        classRoom.setProgram(program);
        classRoom.setCohort(cohort);
        classRoom.setStatus(request.status());

        return map(classRoomRepository.save(classRoom));
    }

    @Override
    public void archive(Long id) {
        ClassRoom classRoom = findActive(id);
        classRoom.setArchived(true);
        classRoom.setStatus(ClassRoomStatus.ARCHIVED);
        classRoomRepository.save(classRoom);
    }

    private ClassRoom findActive(Long id) {
        ClassRoom entity = classRoomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classe introuvable avec l'id : " + id));

        if (entity.isArchived()) {
            throw new ResourceNotFoundException("Classe introuvable avec l'id : " + id);
        }

        return entity;
    }

    private ClassRoomResponse map(ClassRoom entity) {
        return new ClassRoomResponse(
                entity.getId(),
                entity.getName(),
                entity.getCode(),
                entity.getDescription(),
                entity.getCapacity(),
                entity.getDeliveryMode(),
                entity.getRoomLabel(),
                entity.getStatus(),
                entity.getAcademicYear().getId(),
                entity.getAcademicYear().getName(),
                entity.getProgram().getId(),
                entity.getProgram().getName(),
                entity.getCohort() != null ? entity.getCohort().getId() : null,
                entity.getCohort() != null ? entity.getCohort().getName() : null,
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getCreatedBy(),
                entity.getUpdatedBy()
        );
    }
}