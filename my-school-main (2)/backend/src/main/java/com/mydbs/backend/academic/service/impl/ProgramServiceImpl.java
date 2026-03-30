package com.mydbs.backend.academic.service.impl;

import com.mydbs.backend.academic.dto.ProgramCreateRequest;
import com.mydbs.backend.academic.dto.ProgramResponse;
import com.mydbs.backend.academic.dto.ProgramUpdateRequest;
import com.mydbs.backend.academic.model.Program;
import com.mydbs.backend.academic.model.ProgramStatus;
import com.mydbs.backend.academic.repository.ProgramRepository;
import com.mydbs.backend.academic.service.ProgramService;
import com.mydbs.backend.common.exception.DuplicateResourceException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProgramServiceImpl implements ProgramService {

    private final ProgramRepository programRepository;

    public ProgramServiceImpl(ProgramRepository programRepository) {
        this.programRepository = programRepository;
    }

    @Override
    public ProgramResponse create(ProgramCreateRequest request) {
        if (programRepository.existsByCodeIgnoreCase(request.code())) {
            throw new DuplicateResourceException("Un programme avec ce code existe deja");
        }

        Program program = new Program();
        program.setName(request.name());
        program.setCode(request.code());
        program.setDescription(request.description());
        program.setDepartmentName(request.departmentName());
        program.setFacultyName(request.facultyName());
        program.setLevel(request.level());
        program.setDurationInMonths(request.durationInMonths());
        program.setCreditsRequired(request.creditsRequired());
        program.setStatus(request.status() != null ? request.status() : ProgramStatus.DRAFT);

        return map(programRepository.save(program));
    }

    @Override
    public List<ProgramResponse> getAll() {
        return programRepository.findByArchivedFalseOrderByNameAsc()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public ProgramResponse getById(Long id) {
        return map(findActive(id));
    }

    @Override
    public ProgramResponse update(Long id, ProgramUpdateRequest request) {
        Program program = findActive(id);

        programRepository.findByCodeIgnoreCase(request.code())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new DuplicateResourceException("Un autre programme utilise deja ce code");
                    }
                });

        program.setName(request.name());
        program.setCode(request.code());
        program.setDescription(request.description());
        program.setDepartmentName(request.departmentName());
        program.setFacultyName(request.facultyName());
        program.setLevel(request.level());
        program.setDurationInMonths(request.durationInMonths());
        program.setCreditsRequired(request.creditsRequired());
        program.setStatus(request.status());

        return map(programRepository.save(program));
    }

    @Override
    public void archive(Long id) {
        Program program = findActive(id);
        program.setArchived(true);
        program.setStatus(ProgramStatus.ARCHIVED);
        programRepository.save(program);
    }

    private Program findActive(Long id) {
        Program entity = programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programme introuvable avec l'id : " + id));

        if (entity.isArchived()) {
            throw new ResourceNotFoundException("Programme introuvable avec l'id : " + id);
        }

        return entity;
    }

    private ProgramResponse map(Program entity) {
        return new ProgramResponse(
                entity.getId(),
                entity.getName(),
                entity.getCode(),
                entity.getDescription(),
                entity.getDepartmentName(),
                entity.getFacultyName(),
                entity.getLevel(),
                entity.getDurationInMonths(),
                entity.getCreditsRequired(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getCreatedBy(),
                entity.getUpdatedBy()
        );
    }
}