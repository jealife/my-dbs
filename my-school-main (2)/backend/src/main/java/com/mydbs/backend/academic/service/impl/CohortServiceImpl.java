package com.mydbs.backend.academic.service.impl;

import com.mydbs.backend.academic.dto.CohortCreateRequest;
import com.mydbs.backend.academic.dto.CohortResponse;
import com.mydbs.backend.academic.dto.CohortUpdateRequest;
import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.Cohort;
import com.mydbs.backend.academic.model.CohortStatus;
import com.mydbs.backend.academic.model.Program;
import com.mydbs.backend.academic.repository.AcademicYearRepository;
import com.mydbs.backend.academic.repository.CohortRepository;
import com.mydbs.backend.academic.repository.ProgramRepository;
import com.mydbs.backend.academic.service.CohortService;
import com.mydbs.backend.common.exception.DuplicateResourceException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CohortServiceImpl implements CohortService {

    private final CohortRepository cohortRepository;
    private final AcademicYearRepository academicYearRepository;
    private final ProgramRepository programRepository;

    public CohortServiceImpl(CohortRepository cohortRepository,
                             AcademicYearRepository academicYearRepository,
                             ProgramRepository programRepository) {
        this.cohortRepository = cohortRepository;
        this.academicYearRepository = academicYearRepository;
        this.programRepository = programRepository;
    }

    @Override
    public CohortResponse create(CohortCreateRequest request) {
        if (cohortRepository.existsByCodeIgnoreCase(request.code())) {
            throw new DuplicateResourceException("Une cohorte avec ce code existe deja");
        }

        AcademicYear academicYear = academicYearRepository.findById(request.academicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Annee academique introuvable avec l'id : " + request.academicYearId()));

        Program program = programRepository.findById(request.programId())
                .orElseThrow(() -> new ResourceNotFoundException("Programme introuvable avec l'id : " + request.programId()));

        Cohort cohort = new Cohort();
        cohort.setName(request.name());
        cohort.setCode(request.code());
        cohort.setDescription(request.description());
        cohort.setMaxCapacity(request.maxCapacity());
        cohort.setAcademicYear(academicYear);
        cohort.setProgram(program);
        cohort.setStatus(request.status() != null ? request.status() : CohortStatus.PLANNED);

        return map(cohortRepository.save(cohort));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CohortResponse> getAll() {
        return cohortRepository.findByArchivedFalseOrderByNameAsc()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CohortResponse getById(Long id) {
        return map(findActive(id));
    }

    @Override
    public CohortResponse update(Long id, CohortUpdateRequest request) {
        Cohort cohort = findActive(id);

        if (!cohort.getCode().equalsIgnoreCase(request.code()) && cohortRepository.existsByCodeIgnoreCase(request.code())) {
            throw new DuplicateResourceException("Une autre cohorte utilise deja ce code");
        }

        AcademicYear academicYear = academicYearRepository.findById(request.academicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Annee academique introuvable avec l'id : " + request.academicYearId()));

        Program program = programRepository.findById(request.programId())
                .orElseThrow(() -> new ResourceNotFoundException("Programme introuvable avec l'id : " + request.programId()));

        cohort.setName(request.name());
        cohort.setCode(request.code());
        cohort.setDescription(request.description());
        cohort.setMaxCapacity(request.maxCapacity());
        cohort.setAcademicYear(academicYear);
        cohort.setProgram(program);
        cohort.setStatus(request.status());

        return map(cohortRepository.save(cohort));
    }

    @Override
    public void archive(Long id) {
        Cohort cohort = findActive(id);
        cohort.setArchived(true);
        cohort.setStatus(CohortStatus.ARCHIVED);
        cohortRepository.save(cohort);
    }

    private Cohort findActive(Long id) {
        Cohort entity = cohortRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cohorte introuvable avec l'id : " + id));

        if (entity.isArchived()) {
            throw new ResourceNotFoundException("Cohorte introuvable avec l'id : " + id);
        }

        return entity;
    }

    private CohortResponse map(Cohort entity) {
        return new CohortResponse(
                entity.getId(),
                entity.getName(),
                entity.getCode(),
                entity.getDescription(),
                entity.getMaxCapacity(),
                entity.getStatus(),
                entity.getAcademicYear().getId(),
                entity.getAcademicYear().getName(),
                entity.getProgram().getId(),
                entity.getProgram().getName(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getCreatedBy(),
                entity.getUpdatedBy()
        );
    }
}