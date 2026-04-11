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
import com.mydbs.backend.common.model.SystemConfig;
import com.mydbs.backend.common.repository.SystemConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ClassRoomServiceImpl implements ClassRoomService {

    private static final String DEFAULT_CAPACITY_KEY = "DEFAULT_CLASS_CAPACITY";
    private final ClassRoomRepository classRoomRepository;
    private final AcademicYearRepository academicYearRepository;
    private final ProgramRepository programRepository;
    private final CohortRepository cohortRepository;
    private final SystemConfigRepository systemConfigRepository;

    public ClassRoomServiceImpl(ClassRoomRepository classRoomRepository,
                                AcademicYearRepository academicYearRepository,
                                ProgramRepository programRepository,
                                CohortRepository cohortRepository,
                                SystemConfigRepository systemConfigRepository) {
        this.classRoomRepository = classRoomRepository;
        this.academicYearRepository = academicYearRepository;
        this.programRepository = programRepository;
        this.cohortRepository = cohortRepository;
        this.systemConfigRepository = systemConfigRepository;
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
    @Transactional(readOnly = true)
    public List<ClassRoomResponse> getAll() {
        return classRoomRepository.findByArchivedFalseOrderByNameAsc()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
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

    @Override
    @Transactional(readOnly = true)
    public List<ClassRoomResponse> getByProgram(Long programId) {
        return classRoomRepository.findByProgramIdAndArchivedFalseOrderByNameAsc(programId)
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassRoomResponse> getByAcademicYear(Long academicYearId) {
        return classRoomRepository.findByAcademicYearIdAndArchivedFalseOrderByNameAsc(academicYearId)
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public long getStudentCount(Long classRoomId) {
        return classRoomRepository.countStudentsByClassRoomId(classRoomId);
    }

    @Override
    public boolean isClassFull(Long classRoomId) {
        ClassRoom classRoom = findActive(classRoomId);
        if (classRoom.getCapacity() == null) {
            return false;
        }
        long currentCount = getStudentCount(classRoomId);
        return currentCount >= classRoom.getCapacity();
    }

    @Override
    public boolean canEnrollStudent(Long classRoomId) {
        return !isClassFull(classRoomId);
    }

    @Override
    public ClassRoomResponse updateCapacity(Long id, int capacity) {
        if (capacity < 1) {
            throw new IllegalArgumentException("La capacite doit etre superieure a 0");
        }
        ClassRoom classRoom = findActive(id);
        classRoom.setCapacity(capacity);
        return map(classRoomRepository.save(classRoom));
    }

    @Override
    @Transactional
    public void updateAllCapacities(int capacity) {
        if (capacity < 1) {
            throw new IllegalArgumentException("La capacité doit être au moins de 1");
        }
        List<ClassRoom> classes = classRoomRepository.findByArchivedFalseOrderByNameAsc();
        for (ClassRoom classRoom : classes) {
            classRoom.setCapacity(capacity);
        }
        classRoomRepository.saveAll(classes);
    }

    @Override
    @Transactional
    public void setDefaultCapacity(int capacity) {
        if (capacity < 1) {
            throw new IllegalArgumentException("La capacité doit être au moins de 1");
        }
        SystemConfig config = systemConfigRepository.findByKey(DEFAULT_CAPACITY_KEY)
                .orElseGet(() -> {
                    SystemConfig c = new SystemConfig();
                    c.setKey(DEFAULT_CAPACITY_KEY);
                    c.setDescription("Capacité par défaut des classes");
                    return c;
                });
        config.setValue(String.valueOf(capacity));
        systemConfigRepository.save(config);
    }

    @Override
    public int getDefaultCapacity() {
        return systemConfigRepository.findByKey(DEFAULT_CAPACITY_KEY)
                .map(c -> Integer.parseInt(c.getValue()))
                .orElse(30);
    }

    @Override
    public ClassRoom getOrCreateAvailableClassRoom(Program program, AcademicYear academicYear, Cohort cohort) {
        List<ClassRoom> classes = classRoomRepository.findByProgramAndAcademicYear(program.getId(), academicYear.getId());

        for (ClassRoom classRoom : classes) {
            // Si la cohorte est spécifiée, on essaie de rester dans la même cohorte
            if (cohort != null && classRoom.getCohort() != null && !classRoom.getCohort().getId().equals(cohort.getId())) {
                continue;
            }

            if (classRoom.getCapacity() == null) {
                return classRoom;
            }
            long count = classRoomRepository.countStudentsByClassRoomId(classRoom.getId());
            if (count < classRoom.getCapacity()) {
                return classRoom;
            }
        }

        // Aucune classe trouvée ou toutes pleines -> Création automatique
        ClassRoom newClass = new ClassRoom();
        int classNumber = classes.size() + 1;
        String baseName = program.getName();
        newClass.setName(baseName + " - Classe " + classNumber);
        
        String baseCode = program.getCode() != null ? program.getCode() : baseName.substring(0, Math.min(baseName.length(), 4)).toUpperCase();
        String yearPart = academicYear.getName() != null ? academicYear.getName().substring(0, Math.min(academicYear.getName().length(), 4)) : "YEAR";
        String code = generateNextCode(baseCode + "-" + yearPart);
        newClass.setCode(code);
        
        newClass.setCapacity(getDefaultCapacity()); // Utilise le quota global par défaut
        newClass.setDeliveryMode("ON_CAMPUS");
        newClass.setAcademicYear(academicYear);
        newClass.setProgram(program);
        newClass.setCohort(cohort);
        newClass.setStatus(ClassRoomStatus.ACTIVE);
        newClass.setArchived(false);

        return classRoomRepository.save(newClass);
    }

    private String generateNextCode(String baseCode) {
        String base = baseCode.replaceAll("-\\d+$", "");
        int suffix = 1;
        String candidate = base + "-" + suffix;
        while (classRoomRepository.existsByCodeIgnoreCase(candidate)) {
            suffix++;
            candidate = base + "-" + suffix;
        }
        return candidate;
    }

    private ClassRoomResponse map(ClassRoom entity) {
        long studentCount = classRoomRepository.countStudentsByClassRoomId(entity.getId());
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
                studentCount,
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getCreatedBy(),
                entity.getUpdatedBy()
        );
    }
}
