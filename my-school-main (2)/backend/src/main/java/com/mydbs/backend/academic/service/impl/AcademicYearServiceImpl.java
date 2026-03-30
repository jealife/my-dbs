package com.mydbs.backend.academic.service.impl;

import com.mydbs.backend.academic.dto.AcademicYearCreateRequest;
import com.mydbs.backend.academic.dto.AcademicYearResponse;
import com.mydbs.backend.academic.dto.AcademicYearUpdateRequest;
import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.AcademicYearStatus;
import com.mydbs.backend.academic.repository.AcademicYearRepository;
import com.mydbs.backend.academic.service.AcademicYearService;
import com.mydbs.backend.common.exception.DuplicateResourceException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AcademicYearServiceImpl implements AcademicYearService {

    private final AcademicYearRepository academicYearRepository;

    public AcademicYearServiceImpl(AcademicYearRepository academicYearRepository) {
        this.academicYearRepository = academicYearRepository;
    }

    @Override
    public AcademicYearResponse create(AcademicYearCreateRequest request) {
        validateDates(request.startDate(), request.endDate());

        if (academicYearRepository.existsByCodeIgnoreCase(request.code())) {
            throw new DuplicateResourceException("Une annee academique avec ce code existe deja");
        }

        AcademicYear academicYear = new AcademicYear();
        academicYear.setName(request.name());
        academicYear.setCode(request.code());
        academicYear.setDescription(request.description());
        academicYear.setStartDate(request.startDate());
        academicYear.setEndDate(request.endDate());
        academicYear.setCurrentYear(Boolean.TRUE.equals(request.currentYear()));
        academicYear.setStatus(request.status() != null ? request.status() : AcademicYearStatus.PLANNED);

        AcademicYear saved = academicYearRepository.save(academicYear);
        return map(saved);
    }

    @Override
    public List<AcademicYearResponse> getAll() {
        return academicYearRepository.findByArchivedFalseOrderByStartDateDesc()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public AcademicYearResponse getById(Long id) {
        return map(findActive(id));
    }

    @Override
    public AcademicYearResponse update(Long id, AcademicYearUpdateRequest request) {
        validateDates(request.startDate(), request.endDate());

        AcademicYear academicYear = findActive(id);

        academicYearRepository.findByCodeIgnoreCase(request.code())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new DuplicateResourceException("Une autre annee academique utilise deja ce code");
                    }
                });

        academicYear.setName(request.name());
        academicYear.setCode(request.code());
        academicYear.setDescription(request.description());
        academicYear.setStartDate(request.startDate());
        academicYear.setEndDate(request.endDate());
        academicYear.setCurrentYear(Boolean.TRUE.equals(request.currentYear()));
        academicYear.setStatus(request.status());

        return map(academicYearRepository.save(academicYear));
    }

    @Override
    public void archive(Long id) {
        AcademicYear academicYear = findActive(id);
        academicYear.setArchived(true);
        academicYear.setStatus(AcademicYearStatus.ARCHIVED);
        academicYearRepository.save(academicYear);
    }

    private AcademicYear findActive(Long id) {
        AcademicYear entity = academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Annee academique introuvable avec l'id : " + id));

        if (entity.isArchived()) {
            throw new ResourceNotFoundException("Annee academique introuvable avec l'id : " + id);
        }

        return entity;
    }

    private void validateDates(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        if (startDate.isAfter(endDate) || startDate.isEqual(endDate)) {
            throw new IllegalArgumentException("La date de debut doit etre strictement inferieure a la date de fin");
        }
    }

    private AcademicYearResponse map(AcademicYear entity) {
        return new AcademicYearResponse(
                entity.getId(),
                entity.getName(),
                entity.getCode(),
                entity.getDescription(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.isCurrentYear(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getCreatedBy(),
                entity.getUpdatedBy()
        );
    }
}