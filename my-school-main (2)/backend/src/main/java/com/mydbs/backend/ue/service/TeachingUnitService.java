package com.mydbs.backend.ue.service;

import com.mydbs.backend.academic.model.Program;
import com.mydbs.backend.academic.repository.ProgramRepository;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.ue.dto.TeachingUnitRequest;
import com.mydbs.backend.ue.dto.TeachingUnitResponse;
import com.mydbs.backend.ue.model.TeachingUnit;
import com.mydbs.backend.ue.repository.TeachingUnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TeachingUnitService {

    private final TeachingUnitRepository teachingUnitRepository;
    private final ProgramRepository programRepository;

    public TeachingUnitService(TeachingUnitRepository teachingUnitRepository,
                               ProgramRepository programRepository) {
        this.teachingUnitRepository = teachingUnitRepository;
        this.programRepository = programRepository;
    }

    public TeachingUnitResponse create(TeachingUnitRequest request) {
        Program program = findProgram(request.programId());
        TeachingUnit ue = new TeachingUnit();
        ue.setCode(request.code().trim().toUpperCase());
        ue.setName(request.name().trim());
        ue.setDescription(request.description());
        ue.setSemester(request.semester().trim().toUpperCase());
        ue.setOrderIndex(request.orderIndex() != null ? request.orderIndex() : 1);
        ue.setProgram(program);
        return map(teachingUnitRepository.save(ue));
    }

    public TeachingUnitResponse update(Long id, TeachingUnitRequest request) {
        TeachingUnit ue = find(id);
        Program program = findProgram(request.programId());
        ue.setCode(request.code().trim().toUpperCase());
        ue.setName(request.name().trim());
        ue.setDescription(request.description());
        ue.setSemester(request.semester().trim().toUpperCase());
        ue.setOrderIndex(request.orderIndex() != null ? request.orderIndex() : ue.getOrderIndex());
        ue.setProgram(program);
        return map(teachingUnitRepository.save(ue));
    }

    public void delete(Long id) {
        TeachingUnit ue = find(id);
        ue.setArchived(true);
        teachingUnitRepository.save(ue);
    }

    @Transactional(readOnly = true)
    public TeachingUnitResponse getById(Long id) {
        return map(find(id));
    }

    @Transactional(readOnly = true)
    public List<TeachingUnitResponse> getAll() {
        return teachingUnitRepository.findByArchivedFalseOrderByProgramIdAscSemesterAscOrderIndexAsc()
                .stream().map(this::map).toList();
    }

    @Transactional(readOnly = true)
    public List<TeachingUnitResponse> getByProgram(Long programId) {
        return teachingUnitRepository
                .findByProgramIdAndArchivedFalseOrderBySemesterAscOrderIndexAsc(programId)
                .stream().map(this::map).toList();
    }

    @Transactional(readOnly = true)
    public List<TeachingUnitResponse> getByProgramAndSemester(Long programId, String semester) {
        return teachingUnitRepository
                .findByProgramIdAndSemesterAndArchivedFalseOrderByOrderIndexAsc(programId, semester.toUpperCase())
                .stream().map(this::map).toList();
    }

    private TeachingUnit find(Long id) {
        TeachingUnit ue = teachingUnitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UE introuvable : " + id));
        if (ue.isArchived()) throw new ResourceNotFoundException("UE introuvable : " + id);
        return ue;
    }

    private Program findProgram(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programme introuvable : " + id));
    }

    public TeachingUnitResponse map(TeachingUnit ue) {
        return new TeachingUnitResponse(
                ue.getId(), ue.getCode(), ue.getName(), ue.getDescription(),
                ue.getSemester(), ue.getOrderIndex(),
                ue.getProgram().getId(), ue.getProgram().getName(),
                ue.getCreatedAt()
        );
    }
}
