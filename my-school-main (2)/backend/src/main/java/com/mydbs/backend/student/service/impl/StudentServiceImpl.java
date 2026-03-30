package com.mydbs.backend.student.service.impl;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.ClassRoom;
import com.mydbs.backend.academic.model.Cohort;
import com.mydbs.backend.academic.model.Program;
import com.mydbs.backend.academic.repository.AcademicYearRepository;
import com.mydbs.backend.academic.repository.ClassRoomRepository;
import com.mydbs.backend.academic.repository.CohortRepository;
import com.mydbs.backend.academic.repository.ProgramRepository;
import com.mydbs.backend.common.exception.DuplicateResourceException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.student.dto.*;
import com.mydbs.backend.student.model.*;
import com.mydbs.backend.student.repository.EmergencyContactRepository;
import com.mydbs.backend.student.repository.GuardianContactRepository;
import com.mydbs.backend.student.repository.StudentRepository;
import com.mydbs.backend.student.repository.StudentStatusHistoryRepository;
import com.mydbs.backend.student.service.StudentService;
import com.mydbs.backend.user.model.User;
import com.mydbs.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final GuardianContactRepository guardianContactRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final StudentStatusHistoryRepository studentStatusHistoryRepository;
    private final AcademicYearRepository academicYearRepository;
    private final ProgramRepository programRepository;
    private final CohortRepository cohortRepository;
    private final ClassRoomRepository classRoomRepository;
    private final UserRepository userRepository;

    public StudentServiceImpl(StudentRepository studentRepository,
                              GuardianContactRepository guardianContactRepository,
                              EmergencyContactRepository emergencyContactRepository,
                              StudentStatusHistoryRepository studentStatusHistoryRepository,
                              AcademicYearRepository academicYearRepository,
                              ProgramRepository programRepository,
                              CohortRepository cohortRepository,
                              ClassRoomRepository classRoomRepository,
                              UserRepository userRepository) {
        this.studentRepository = studentRepository;
        this.guardianContactRepository = guardianContactRepository;
        this.emergencyContactRepository = emergencyContactRepository;
        this.studentStatusHistoryRepository = studentStatusHistoryRepository;
        this.academicYearRepository = academicYearRepository;
        this.programRepository = programRepository;
        this.cohortRepository = cohortRepository;
        this.classRoomRepository = classRoomRepository;
        this.userRepository = userRepository;
    }

    @Override
    public StudentResponse create(StudentCreateRequest request) {
        if (studentRepository.existsByStudentNumberIgnoreCase(request.studentNumber())) {
            throw new DuplicateResourceException("Un etudiant avec ce matricule existe deja");
        }

        User user = getUser(request.userId(), false);
        AcademicYear academicYear = getAcademicYear(request.academicYearId());
        Program program = getProgram(request.programId());
        Cohort cohort = getCohort(request.cohortId());
        ClassRoom classRoom = getClassRoom(request.classRoomId());

        Student student = new Student();
        applyStudentData(student, request.studentNumber(), request.admissionNumber(), request.registrationNumber(),
                request.firstName(), request.lastName(), request.middleName(), request.email(), request.phoneNumber(),
                request.secondaryPhoneNumber(), request.gender(), request.nationality(), request.cityOfBirth(),
                request.countryOfBirth(), request.dateOfBirth(), request.nationalIdNumber(), request.passportNumber(),
                request.addressLine(), request.city(), request.country(), request.postalCode(), request.photoUrl(),
                request.medicalNotes(), request.specialNeedsNotes(), request.admissionDate(), request.registrationDate(),
                request.expectedGraduationDate(), Boolean.TRUE.equals(request.scholarshipHolder()),
                Boolean.TRUE.equals(request.internationalStudent()), Boolean.TRUE.equals(request.workingStudent()),
                request.status() != null ? request.status() : StudentStatus.APPLIED,
                request.enrollmentType() != null ? request.enrollmentType() : EnrollmentType.NEW_ADMISSION,
                user, academicYear, program, cohort, classRoom);

        Student saved = studentRepository.save(student);
        syncGuardians(saved, request.guardians());
        syncEmergencyContacts(saved, request.emergencyContacts());
        createStatusHistory(saved, null, saved.getStatus(), "Creation initiale de l'etudiant", "CREATE_STUDENT");

        return map(findActive(saved.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponse> getAll() {
        return studentRepository.findByArchivedFalseOrderByLastNameAscFirstNameAsc()
                .stream()
                .map(student -> map(findActive(student.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponse getById(Long id) {
        return map(findActive(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponse> getByClassRoom(Long classRoomId) {
        return studentRepository.findByClassRoomIdAndArchivedFalseOrderByLastNameAscFirstNameAsc(classRoomId)
                .stream()
                .map(student -> map(findActive(student.getId())))
                .toList();
    }

    @Override
    public StudentResponse update(Long id, StudentUpdateRequest request) {
        Student student = findActive(id);

        studentRepository.findByStudentNumberIgnoreCase(request.studentNumber())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new DuplicateResourceException("Un autre etudiant utilise deja ce matricule");
                    }
                });

        User user = getUser(request.userId(), true);
        AcademicYear academicYear = getAcademicYear(request.academicYearId());
        Program program = getProgram(request.programId());
        Cohort cohort = getCohort(request.cohortId());
        ClassRoom classRoom = getClassRoom(request.classRoomId());

        StudentStatus oldStatus = student.getStatus();

        applyStudentData(student, request.studentNumber(), request.admissionNumber(), request.registrationNumber(),
                request.firstName(), request.lastName(), request.middleName(), request.email(), request.phoneNumber(),
                request.secondaryPhoneNumber(), request.gender(), request.nationality(), request.cityOfBirth(),
                request.countryOfBirth(), request.dateOfBirth(), request.nationalIdNumber(), request.passportNumber(),
                request.addressLine(), request.city(), request.country(), request.postalCode(), request.photoUrl(),
                request.medicalNotes(), request.specialNeedsNotes(), request.admissionDate(), request.registrationDate(),
                request.expectedGraduationDate(), Boolean.TRUE.equals(request.scholarshipHolder()),
                Boolean.TRUE.equals(request.internationalStudent()), Boolean.TRUE.equals(request.workingStudent()),
                request.status(), request.enrollmentType(), user, academicYear, program, cohort, classRoom);

        Student updated = studentRepository.save(student);

        syncGuardians(updated, request.guardians());
        syncEmergencyContacts(updated, request.emergencyContacts());

        if (oldStatus != updated.getStatus()) {
            createStatusHistory(updated, oldStatus, updated.getStatus(), "Changement de statut via mise a jour", "UPDATE_STUDENT");
        }

        return map(findActive(updated.getId()));
    }

    @Override
    public StudentResponse updateStatus(Long id, StudentStatusUpdateRequest request) {
        Student student = findActive(id);
        StudentStatus oldStatus = student.getStatus();

        if (oldStatus == request.status()) {
            throw new IllegalArgumentException("Le nouveau statut est identique au statut actuel");
        }

        student.setStatus(request.status());
        Student updated = studentRepository.save(student);

        createStatusHistory(updated, oldStatus, updated.getStatus(), request.reason(), request.contextLabel());

        return map(findActive(updated.getId()));
    }

    @Override
    public void archive(Long id) {
        Student student = findActive(id);
        StudentStatus oldStatus = student.getStatus();
        student.setArchived(true);
        student.setStatus(StudentStatus.ARCHIVED);
        studentRepository.save(student);

        createStatusHistory(student, oldStatus, StudentStatus.ARCHIVED, "Archivage logique de l'etudiant", "ARCHIVE_STUDENT");
    }

    private void applyStudentData(Student student,
                                  String studentNumber,
                                  String admissionNumber,
                                  String registrationNumber,
                                  String firstName,
                                  String lastName,
                                  String middleName,
                                  String email,
                                  String phoneNumber,
                                  String secondaryPhoneNumber,
                                  String gender,
                                  String nationality,
                                  String cityOfBirth,
                                  String countryOfBirth,
                                  java.time.LocalDate dateOfBirth,
                                  String nationalIdNumber,
                                  String passportNumber,
                                  String addressLine,
                                  String city,
                                  String country,
                                  String postalCode,
                                  String photoUrl,
                                  String medicalNotes,
                                  String specialNeedsNotes,
                                  java.time.LocalDate admissionDate,
                                  java.time.LocalDate registrationDate,
                                  java.time.LocalDate expectedGraduationDate,
                                  boolean scholarshipHolder,
                                  boolean internationalStudent,
                                  boolean workingStudent,
                                  StudentStatus status,
                                  EnrollmentType enrollmentType,
                                  User user,
                                  AcademicYear academicYear,
                                  Program program,
                                  Cohort cohort,
                                  ClassRoom classRoom) {

        if (dateOfBirth != null && dateOfBirth.isAfter(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("La date de naissance ne peut pas etre dans le futur");
        }

        student.setStudentNumber(studentNumber);
        student.setAdmissionNumber(admissionNumber);
        student.setRegistrationNumber(registrationNumber);
        student.setFirstName(firstName);
        student.setLastName(lastName);
        student.setMiddleName(middleName);
        student.setEmail(email);
        student.setPhoneNumber(phoneNumber);
        student.setSecondaryPhoneNumber(secondaryPhoneNumber);
        student.setGender(gender);
        student.setNationality(nationality);
        student.setCityOfBirth(cityOfBirth);
        student.setCountryOfBirth(countryOfBirth);
        student.setDateOfBirth(dateOfBirth);
        student.setNationalIdNumber(nationalIdNumber);
        student.setPassportNumber(passportNumber);
        student.setAddressLine(addressLine);
        student.setCity(city);
        student.setCountry(country);
        student.setPostalCode(postalCode);
        student.setPhotoUrl(photoUrl);
        student.setMedicalNotes(medicalNotes);
        student.setSpecialNeedsNotes(specialNeedsNotes);
        student.setAdmissionDate(admissionDate);
        student.setRegistrationDate(registrationDate);
        student.setExpectedGraduationDate(expectedGraduationDate);
        student.setScholarshipHolder(scholarshipHolder);
        student.setInternationalStudent(internationalStudent);
        student.setWorkingStudent(workingStudent);
        student.setStatus(status);
        student.setEnrollmentType(enrollmentType);
        student.setUser(user);
        student.setAcademicYear(academicYear);
        student.setProgram(program);
        student.setCohort(cohort);
        student.setClassRoom(classRoom);
    }

    private void syncGuardians(Student student, List<GuardianContactRequest> guardians) {
        guardianContactRepository.deleteByStudentId(student.getId());

        if (guardians == null || guardians.isEmpty()) {
            return;
        }

        List<GuardianContact> entities = guardians.stream().map(g -> {
            GuardianContact guardian = new GuardianContact();
            guardian.setStudent(student);
            guardian.setFullName(g.fullName());
            guardian.setRelationshipLabel(g.relationshipLabel());
            guardian.setPhoneNumber(g.phoneNumber());
            guardian.setSecondaryPhoneNumber(g.secondaryPhoneNumber());
            guardian.setEmail(g.email());
            guardian.setAddressLine(g.addressLine());
            guardian.setCity(g.city());
            guardian.setCountry(g.country());
            guardian.setPrimaryContact(Boolean.TRUE.equals(g.primaryContact()));
            return guardian;
        }).toList();

        guardianContactRepository.saveAll(entities);
    }

    private void syncEmergencyContacts(Student student, List<EmergencyContactRequest> emergencyContacts) {
        emergencyContactRepository.deleteByStudentId(student.getId());

        if (emergencyContacts == null || emergencyContacts.isEmpty()) {
            return;
        }

        List<EmergencyContact> entities = emergencyContacts.stream().map(e -> {
            EmergencyContact contact = new EmergencyContact();
            contact.setStudent(student);
            contact.setFullName(e.fullName());
            contact.setRelationshipLabel(e.relationshipLabel());
            contact.setPhoneNumber(e.phoneNumber());
            contact.setSecondaryPhoneNumber(e.secondaryPhoneNumber());
            contact.setEmail(e.email());
            contact.setAddressLine(e.addressLine());
            contact.setPriorityOrder(e.priorityOrder());
            return contact;
        }).toList();

        emergencyContactRepository.saveAll(entities);
    }

    private void createStatusHistory(Student student,
                                     StudentStatus oldStatus,
                                     StudentStatus newStatus,
                                     String reason,
                                     String contextLabel) {
        StudentStatusHistory history = new StudentStatusHistory();
        history.setStudent(student);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setReason(reason);
        history.setContextLabel(contextLabel);
        studentStatusHistoryRepository.save(history);
    }

    private Student findActive(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Etudiant introuvable avec l'id : " + id));

        if (student.isArchived()) {
            throw new ResourceNotFoundException("Etudiant introuvable avec l'id : " + id);
        }

        return student;
    }

    private User getUser(Long userId, boolean allowNull) {
        if (userId == null) {
            if (allowNull) {
                return null;
            }
            return null;
        }

        if (studentRepository.existsByUserId(userId)) {
            User maybeUser = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'id : " + userId));
            return maybeUser;
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

    private Cohort getCohort(Long cohortId) {
        if (cohortId == null) {
            return null;
        }
        return cohortRepository.findById(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Cohorte introuvable avec l'id : " + cohortId));
    }

    private ClassRoom getClassRoom(Long classRoomId) {
        if (classRoomId == null) {
            return null;
        }
        return classRoomRepository.findById(classRoomId)
                .orElseThrow(() -> new ResourceNotFoundException("Classe introuvable avec l'id : " + classRoomId));
    }

    private StudentResponse map(Student student) {
        List<GuardianContactResponse> guardians = guardianContactRepository
                .findByStudentIdAndArchivedFalseOrderByPrimaryContactDescCreatedAtAsc(student.getId())
                .stream()
                .map(g -> new GuardianContactResponse(
                        g.getId(),
                        g.getFullName(),
                        g.getRelationshipLabel(),
                        g.getPhoneNumber(),
                        g.getSecondaryPhoneNumber(),
                        g.getEmail(),
                        g.getAddressLine(),
                        g.getCity(),
                        g.getCountry(),
                        g.isPrimaryContact(),
                        g.getCreatedAt(),
                        g.getUpdatedAt()
                ))
                .toList();

        List<EmergencyContactResponse> emergencyContacts = emergencyContactRepository
                .findByStudentIdAndArchivedFalseOrderByPriorityOrderAsc(student.getId())
                .stream()
                .map(e -> new EmergencyContactResponse(
                        e.getId(),
                        e.getFullName(),
                        e.getRelationshipLabel(),
                        e.getPhoneNumber(),
                        e.getSecondaryPhoneNumber(),
                        e.getEmail(),
                        e.getAddressLine(),
                        e.getPriorityOrder(),
                        e.getCreatedAt(),
                        e.getUpdatedAt()
                ))
                .toList();

        List<StudentStatusHistoryResponse> statusHistory = studentStatusHistoryRepository
                .findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(h -> new StudentStatusHistoryResponse(
                        h.getId(),
                        h.getOldStatus(),
                        h.getNewStatus(),
                        h.getReason(),
                        h.getContextLabel(),
                        h.getCreatedAt(),
                        h.getCreatedBy()
                ))
                .toList();

        return new StudentResponse(
                student.getId(),
                student.getStudentNumber(),
                student.getAdmissionNumber(),
                student.getRegistrationNumber(),
                student.getFirstName(),
                student.getLastName(),
                student.getMiddleName(),
                student.getEmail(),
                student.getPhoneNumber(),
                student.getSecondaryPhoneNumber(),
                student.getGender(),
                student.getNationality(),
                student.getCityOfBirth(),
                student.getCountryOfBirth(),
                student.getDateOfBirth(),
                student.getNationalIdNumber(),
                student.getPassportNumber(),
                student.getAddressLine(),
                student.getCity(),
                student.getCountry(),
                student.getPostalCode(),
                student.getPhotoUrl(),
                student.getMedicalNotes(),
                student.getSpecialNeedsNotes(),
                student.getAdmissionDate(),
                student.getRegistrationDate(),
                student.getExpectedGraduationDate(),
                student.isScholarshipHolder(),
                student.isInternationalStudent(),
                student.isWorkingStudent(),
                student.getStatus(),
                student.getEnrollmentType(),
                student.getUser() != null ? student.getUser().getId() : null,
                student.getUser() != null ? student.getUser().getEmail() : null,
                student.getAcademicYear().getId(),
                student.getAcademicYear().getName(),
                student.getProgram().getId(),
                student.getProgram().getName(),
                student.getCohort() != null ? student.getCohort().getId() : null,
                student.getCohort() != null ? student.getCohort().getName() : null,
                student.getClassRoom() != null ? student.getClassRoom().getId() : null,
                student.getClassRoom() != null ? student.getClassRoom().getName() : null,
                guardians,
                emergencyContacts,
                statusHistory,
                student.getCreatedAt(),
                student.getUpdatedAt(),
                student.getCreatedBy(),
                student.getUpdatedBy()
        );
    }
}