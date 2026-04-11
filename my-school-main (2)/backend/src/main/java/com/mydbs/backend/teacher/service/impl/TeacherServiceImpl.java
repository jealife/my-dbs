package com.mydbs.backend.teacher.service.impl;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.ClassRoom;
import com.mydbs.backend.academic.model.Program;
import com.mydbs.backend.academic.repository.AcademicYearRepository;
import com.mydbs.backend.academic.repository.ClassRoomRepository;
import com.mydbs.backend.academic.repository.ProgramRepository;
import com.mydbs.backend.common.exception.DuplicateResourceException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.teacher.dto.*;
import com.mydbs.backend.teacher.model.*;
import com.mydbs.backend.teacher.repository.TeacherQualificationRepository;
import com.mydbs.backend.teacher.repository.TeacherRepository;
import com.mydbs.backend.teacher.repository.TeacherSpecializationRepository;
import com.mydbs.backend.teacher.repository.TeacherStatusHistoryRepository;
import com.mydbs.backend.teacher.service.TeacherService;
import com.mydbs.backend.user.model.User;
import com.mydbs.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;
    private final TeacherQualificationRepository teacherQualificationRepository;
    private final TeacherSpecializationRepository teacherSpecializationRepository;
    private final TeacherStatusHistoryRepository teacherStatusHistoryRepository;
    private final AcademicYearRepository academicYearRepository;
    private final ProgramRepository programRepository;
    private final ClassRoomRepository classRoomRepository;
    private final UserRepository userRepository;

    public TeacherServiceImpl(TeacherRepository teacherRepository,
                              TeacherQualificationRepository teacherQualificationRepository,
                              TeacherSpecializationRepository teacherSpecializationRepository,
                              TeacherStatusHistoryRepository teacherStatusHistoryRepository,
                              AcademicYearRepository academicYearRepository,
                              ProgramRepository programRepository,
                              ClassRoomRepository classRoomRepository,
                              UserRepository userRepository) {
        this.teacherRepository = teacherRepository;
        this.teacherQualificationRepository = teacherQualificationRepository;
        this.teacherSpecializationRepository = teacherSpecializationRepository;
        this.teacherStatusHistoryRepository = teacherStatusHistoryRepository;
        this.academicYearRepository = academicYearRepository;
        this.programRepository = programRepository;
        this.classRoomRepository = classRoomRepository;
        this.userRepository = userRepository;
    }

    @Override
    public TeacherResponse create(TeacherCreateRequest request) {
        if (teacherRepository.existsByTeacherNumberIgnoreCase(request.teacherNumber())) {
            throw new DuplicateResourceException("Un enseignant avec ce matricule existe deja");
        }

        User user = getUser(request.userId(), false, null);
        AcademicYear academicYear = getAcademicYear(request.academicYearId());
        Program program = getProgram(request.programId());
        ClassRoom classRoom = getClassRoom(request.classRoomId());

        Teacher teacher = new Teacher();
        applyTeacherData(
                teacher,
                request.teacherNumber(),
                request.employeeNumber(),
                request.firstName(),
                request.lastName(),
                request.middleName(),
                request.email(),
                request.phoneNumber(),
                request.secondaryPhoneNumber(),
                request.gender(),
                request.nationality(),
                request.dateOfBirth(),
                request.nationalIdNumber(),
                request.passportNumber(),
                request.addressLine(),
                request.city(),
                request.country(),
                request.postalCode(),
                request.photoUrl(),
                request.bio(),
                request.specialNotes(),
                request.hireDate(),
                request.endContractDate(),
                request.officeLocation(),
                request.officeHours(),
                request.highestDegree(),
                request.yearsOfExperience(),
                request.teachingHoursQuota(),
                Boolean.TRUE.equals(request.remoteAvailable()),
                request.status() != null ? request.status() : TeacherStatus.PENDING,
                request.employmentType() != null ? request.employmentType() : EmploymentType.FULL_TIME,
                user,
                academicYear,
                program,
                classRoom
        );

        Teacher saved = teacherRepository.save(teacher);
        syncQualifications(saved, request.qualifications());
        syncSpecializations(saved, request.specializations());
        createStatusHistory(saved, null, saved.getStatus(), "Creation initiale de l'enseignant", "CREATE_TEACHER");

        return map(findActive(saved.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeacherResponse> getAll() {
        return teacherRepository.findByArchivedFalseOrderByLastNameAscFirstNameAsc()
                .stream()
                .map(teacher -> map(findActive(teacher.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TeacherResponse getById(Long id) {
        return map(findActive(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeacherResponse> getByProgram(Long programId) {
        return teacherRepository.findByProgramIdAndArchivedFalseOrderByLastNameAscFirstNameAsc(programId)
                .stream()
                .map(teacher -> map(findActive(teacher.getId())))
                .toList();
    }

    @Override
    public TeacherResponse update(Long id, TeacherUpdateRequest request) {
        Teacher teacher = findActive(id);

        teacherRepository.findByTeacherNumberIgnoreCase(request.teacherNumber())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new DuplicateResourceException("Un autre enseignant utilise deja ce matricule");
                    }
                });

        User user = getUser(request.userId(), true, id);
        AcademicYear academicYear = getAcademicYear(request.academicYearId());
        Program program = getProgram(request.programId());
        ClassRoom classRoom = getClassRoom(request.classRoomId());

        TeacherStatus oldStatus = teacher.getStatus();

        applyTeacherData(
                teacher,
                request.teacherNumber(),
                request.employeeNumber(),
                request.firstName(),
                request.lastName(),
                request.middleName(),
                request.email(),
                request.phoneNumber(),
                request.secondaryPhoneNumber(),
                request.gender(),
                request.nationality(),
                request.dateOfBirth(),
                request.nationalIdNumber(),
                request.passportNumber(),
                request.addressLine(),
                request.city(),
                request.country(),
                request.postalCode(),
                request.photoUrl(),
                request.bio(),
                request.specialNotes(),
                request.hireDate(),
                request.endContractDate(),
                request.officeLocation(),
                request.officeHours(),
                request.highestDegree(),
                request.yearsOfExperience(),
                request.teachingHoursQuota(),
                Boolean.TRUE.equals(request.remoteAvailable()),
                request.status(),
                request.employmentType(),
                user,
                academicYear,
                program,
                classRoom
        );

        Teacher updated = teacherRepository.save(teacher);
        syncQualifications(updated, request.qualifications());
        syncSpecializations(updated, request.specializations());

        if (oldStatus != updated.getStatus()) {
            createStatusHistory(updated, oldStatus, updated.getStatus(), "Changement de statut via mise a jour", "UPDATE_TEACHER");
        }

        return map(findActive(updated.getId()));
    }

    @Override
    public TeacherResponse updateStatus(Long id, TeacherStatusUpdateRequest request) {
        Teacher teacher = findActive(id);
        TeacherStatus oldStatus = teacher.getStatus();

        if (oldStatus == request.status()) {
            throw new IllegalArgumentException("Le nouveau statut est identique au statut actuel");
        }

        teacher.setStatus(request.status());
        Teacher updated = teacherRepository.save(teacher);

        createStatusHistory(updated, oldStatus, updated.getStatus(), request.reason(), request.contextLabel());

        return map(findActive(updated.getId()));
    }

    @Override
    public void archive(Long id) {
        Teacher teacher = findActive(id);
        TeacherStatus oldStatus = teacher.getStatus();
        teacher.setArchived(true);
        teacher.setStatus(TeacherStatus.ARCHIVED);
        teacherRepository.save(teacher);

        createStatusHistory(teacher, oldStatus, TeacherStatus.ARCHIVED, "Archivage logique de l'enseignant", "ARCHIVE_TEACHER");
    }

    private void applyTeacherData(Teacher teacher,
                                  String teacherNumber,
                                  String employeeNumber,
                                  String firstName,
                                  String lastName,
                                  String middleName,
                                  String email,
                                  String phoneNumber,
                                  String secondaryPhoneNumber,
                                  String gender,
                                  String nationality,
                                  java.time.LocalDate dateOfBirth,
                                  String nationalIdNumber,
                                  String passportNumber,
                                  String addressLine,
                                  String city,
                                  String country,
                                  String postalCode,
                                  String photoUrl,
                                  String bio,
                                  String specialNotes,
                                  java.time.LocalDate hireDate,
                                  java.time.LocalDate endContractDate,
                                  String officeLocation,
                                  String officeHours,
                                  String highestDegree,
                                  Integer yearsOfExperience,
                                  Integer teachingHoursQuota,
                                  boolean remoteAvailable,
                                  TeacherStatus status,
                                  EmploymentType employmentType,
                                  User user,
                                  AcademicYear academicYear,
                                  Program program,
                                  ClassRoom classRoom) {

        if (dateOfBirth != null && dateOfBirth.isAfter(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("La date de naissance ne peut pas etre dans le futur");
        }

        if (yearsOfExperience != null && yearsOfExperience < 0) {
            throw new IllegalArgumentException("Le nombre d'annees d'experience ne peut pas etre negatif");
        }

        if (teachingHoursQuota != null && teachingHoursQuota < 0) {
            throw new IllegalArgumentException("Le quota horaire ne peut pas etre negatif");
        }

        teacher.setTeacherNumber(teacherNumber);
        teacher.setEmployeeNumber(employeeNumber);
        teacher.setFirstName(firstName);
        teacher.setLastName(lastName);
        teacher.setMiddleName(middleName);
        teacher.setEmail(email);
        teacher.setPhoneNumber(phoneNumber);
        teacher.setSecondaryPhoneNumber(secondaryPhoneNumber);
        teacher.setGender(gender);
        teacher.setNationality(nationality);
        teacher.setDateOfBirth(dateOfBirth);
        teacher.setNationalIdNumber(nationalIdNumber);
        teacher.setPassportNumber(passportNumber);
        teacher.setAddressLine(addressLine);
        teacher.setCity(city);
        teacher.setCountry(country);
        teacher.setPostalCode(postalCode);
        teacher.setPhotoUrl(photoUrl);
        teacher.setBio(bio);
        teacher.setSpecialNotes(specialNotes);
        teacher.setHireDate(hireDate);
        teacher.setEndContractDate(endContractDate);
        teacher.setOfficeLocation(officeLocation);
        teacher.setOfficeHours(officeHours);
        teacher.setHighestDegree(highestDegree);
        teacher.setYearsOfExperience(yearsOfExperience);
        teacher.setTeachingHoursQuota(teachingHoursQuota);
        teacher.setRemoteAvailable(remoteAvailable);
        teacher.setStatus(status);
        teacher.setEmploymentType(employmentType);
        teacher.setUser(user);
        teacher.setAcademicYear(academicYear);
        teacher.setProgram(program);
        teacher.setClassRoom(classRoom);
    }

    private void syncQualifications(Teacher teacher, List<TeacherQualificationRequest> qualifications) {
        teacherQualificationRepository.deleteByTeacherId(teacher.getId());

        if (qualifications == null || qualifications.isEmpty()) {
            return;
        }

        List<TeacherQualification> entities = qualifications.stream().map(q -> {
            TeacherQualification qualification = new TeacherQualification();
            qualification.setTeacher(teacher);
            qualification.setTitle(q.title());
            qualification.setInstitutionName(q.institutionName());
            qualification.setCountry(q.country());
            qualification.setYearAwarded(q.yearAwarded());
            qualification.setDescription(q.description());
            return qualification;
        }).toList();

        teacherQualificationRepository.saveAll(entities);
    }

    private void syncSpecializations(Teacher teacher, List<TeacherSpecializationRequest> specializations) {
        teacherSpecializationRepository.deleteByTeacherId(teacher.getId());

        if (specializations == null || specializations.isEmpty()) {
            return;
        }

        List<TeacherSpecialization> entities = specializations.stream().map(s -> {
            TeacherSpecialization specialization = new TeacherSpecialization();
            specialization.setTeacher(teacher);
            specialization.setLabel(s.label());
            specialization.setDescription(s.description());
            specialization.setPrimarySpecialization(Boolean.TRUE.equals(s.primarySpecialization()));
            return specialization;
        }).toList();

        teacherSpecializationRepository.saveAll(entities);
    }

    private void createStatusHistory(Teacher teacher,
                                     TeacherStatus oldStatus,
                                     TeacherStatus newStatus,
                                     String reason,
                                     String contextLabel) {
        TeacherStatusHistory history = new TeacherStatusHistory();
        history.setTeacher(teacher);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setReason(reason);
        history.setContextLabel(contextLabel);
        teacherStatusHistoryRepository.save(history);
    }

    private Teacher findActive(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enseignant introuvable avec l'id : " + id));

        if (teacher.isArchived()) {
            throw new ResourceNotFoundException("Enseignant introuvable avec l'id : " + id);
        }

        return teacher;
    }

    private User getUser(Long userId, boolean allowNull, Long currentTeacherId) {
        if (userId == null) {
            return null;
        }

        if (teacherRepository.existsByUserId(userId)) {
            Teacher existingTeacher = teacherRepository.findAll().stream()
                    .filter(t -> t.getUser() != null && t.getUser().getId().equals(userId))
                    .findFirst()
                    .orElse(null);

            if (existingTeacher != null && (currentTeacherId == null || !existingTeacher.getId().equals(currentTeacherId))) {
                throw new DuplicateResourceException("Cet utilisateur est deja lie a un autre enseignant");
            }
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'id : " + userId));
    }

    private AcademicYear getAcademicYear(Long academicYearId) {
        return academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new ResourceNotFoundException("Annee academique introuvable avec l'id : " + academicYearId));
    }

    private Program getProgram(Long programId) {
        return programRepository.findById(programId)
                .orElseThrow(() -> new ResourceNotFoundException("Programme introuvable avec l'id : " + programId));
    }

    private ClassRoom getClassRoom(Long classRoomId) {
        if (classRoomId == null) {
            return null;
        }
        return classRoomRepository.findById(classRoomId)
                .orElseThrow(() -> new ResourceNotFoundException("Classe introuvable avec l'id : " + classRoomId));
    }

    private TeacherResponse map(Teacher teacher) {
        List<TeacherQualificationResponse> qualifications = teacherQualificationRepository
                .findByTeacherIdAndArchivedFalseOrderByYearAwardedDescCreatedAtAsc(teacher.getId())
                .stream()
                .map(q -> new TeacherQualificationResponse(
                        q.getId(),
                        q.getTitle(),
                        q.getInstitutionName(),
                        q.getCountry(),
                        q.getYearAwarded(),
                        q.getDescription(),
                        q.getCreatedAt(),
                        q.getUpdatedAt()
                ))
                .toList();

        List<TeacherSpecializationResponse> specializations = teacherSpecializationRepository
                .findByTeacherIdAndArchivedFalseOrderByPrimarySpecializationDescCreatedAtAsc(teacher.getId())
                .stream()
                .map(s -> new TeacherSpecializationResponse(
                        s.getId(),
                        s.getLabel(),
                        s.getDescription(),
                        s.isPrimarySpecialization(),
                        s.getCreatedAt(),
                        s.getUpdatedAt()
                ))
                .toList();

        List<TeacherStatusHistoryResponse> statusHistory = teacherStatusHistoryRepository
                .findByTeacherIdOrderByCreatedAtDesc(teacher.getId())
                .stream()
                .map(h -> new TeacherStatusHistoryResponse(
                        h.getId(),
                        h.getOldStatus(),
                        h.getNewStatus(),
                        h.getReason(),
                        h.getContextLabel(),
                        h.getCreatedAt(),
                        h.getCreatedBy()
                ))
                .toList();

        return new TeacherResponse(
                teacher.getId(),
                teacher.getTeacherNumber(),
                teacher.getEmployeeNumber(),
                teacher.getFirstName(),
                teacher.getLastName(),
                teacher.getMiddleName(),
                teacher.getEmail(),
                teacher.getPhoneNumber(),
                teacher.getSecondaryPhoneNumber(),
                teacher.getGender(),
                teacher.getNationality(),
                teacher.getDateOfBirth(),
                teacher.getNationalIdNumber(),
                teacher.getPassportNumber(),
                teacher.getAddressLine(),
                teacher.getCity(),
                teacher.getCountry(),
                teacher.getPostalCode(),
                teacher.getPhotoUrl(),
                teacher.getBio(),
                teacher.getSpecialNotes(),
                teacher.getHireDate(),
                teacher.getEndContractDate(),
                teacher.getOfficeLocation(),
                teacher.getOfficeHours(),
                teacher.getHighestDegree(),
                teacher.getYearsOfExperience(),
                teacher.getTeachingHoursQuota(),
                teacher.isRemoteAvailable(),
                teacher.getStatus(),
                teacher.getEmploymentType(),
                teacher.getUser() != null ? teacher.getUser().getId() : null,
                teacher.getUser() != null ? teacher.getUser().getEmail() : null,
                teacher.getAcademicYear().getId(),
                teacher.getAcademicYear().getName(),
                teacher.getProgram().getId(),
                teacher.getProgram().getName(),
                teacher.getClassRoom() != null ? teacher.getClassRoom().getId() : null,
                teacher.getClassRoom() != null ? teacher.getClassRoom().getName() : null,
                qualifications,
                specializations,
                statusHistory,
                teacher.getCreatedAt(),
                teacher.getUpdatedAt(),
                teacher.getCreatedBy(),
                teacher.getUpdatedBy()
        );
    }
}