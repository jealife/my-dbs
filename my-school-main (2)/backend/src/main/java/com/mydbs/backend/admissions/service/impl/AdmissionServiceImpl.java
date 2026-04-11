package com.mydbs.backend.admissions.service.impl;

import com.mydbs.backend.academic.model.AcademicYear;
import com.mydbs.backend.academic.model.Cohort;
import com.mydbs.backend.academic.model.Program;
import com.mydbs.backend.academic.repository.AcademicYearRepository;
import com.mydbs.backend.academic.repository.CohortRepository;
import com.mydbs.backend.academic.repository.ProgramRepository;
import com.mydbs.backend.admissions.dto.*;
import com.mydbs.backend.admissions.model.*;
import com.mydbs.backend.admissions.repository.AdmissionApplicationRepository;
import com.mydbs.backend.admissions.repository.AdmissionNoteRepository;
import com.mydbs.backend.admissions.repository.SupportingDocumentRepository;
import com.mydbs.backend.admissions.service.AdmissionService;
import com.mydbs.backend.email.EmailService;
import com.mydbs.backend.common.exception.DuplicateResourceException;
import com.mydbs.backend.common.exception.FileStorageException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.student.model.EnrollmentType;
import com.mydbs.backend.student.model.Student;
import com.mydbs.backend.student.model.StudentStatus;
import com.mydbs.backend.student.repository.StudentRepository;
import com.mydbs.backend.user.model.User;
import com.mydbs.backend.user.model.UserRole;
import com.mydbs.backend.user.model.UserStatus;
import com.mydbs.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Transactional
public class AdmissionServiceImpl implements AdmissionService {

    private static final AtomicInteger SEQUENCE = new AtomicInteger(1);

    private final AdmissionApplicationRepository applicationRepository;
    private final SupportingDocumentRepository documentRepository;
    private final AdmissionNoteRepository noteRepository;
    private final ProgramRepository programRepository;
    private final AcademicYearRepository academicYearRepository;
    private final CohortRepository cohortRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final com.mydbs.backend.academic.service.ClassRoomService classRoomService;

    @Value("${app.storage.local.base-dir:uploads}")
    private String baseDir;

    public AdmissionServiceImpl(AdmissionApplicationRepository applicationRepository,
                                SupportingDocumentRepository documentRepository,
                                AdmissionNoteRepository noteRepository,
                                ProgramRepository programRepository,
                                AcademicYearRepository academicYearRepository,
                                CohortRepository cohortRepository,
                                StudentRepository studentRepository,
                                UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                EmailService emailService,
                                com.mydbs.backend.academic.service.ClassRoomService classRoomService) {
        this.applicationRepository = applicationRepository;
        this.documentRepository = documentRepository;
        this.noteRepository = noteRepository;
        this.programRepository = programRepository;
        this.academicYearRepository = academicYearRepository;
        this.cohortRepository = cohortRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.classRoomService = classRoomService;
    }

    // ─────────────────────── CRUD APPLICATION ───────────────────────────────

    @Override
    public AdmissionApplicationResponse create(AdmissionApplicationCreateRequest request) {
        // Validation du programId
        if (request.programId() == null) {
            throw new IllegalArgumentException("L'identifiant du programme est obligatoire");
        }
        
        Program program = findProgram(request.programId());
        AcademicYear academicYear = request.academicYearId() != null
                ? findAcademicYear(request.academicYearId())
                : academicYearRepository.findByArchivedFalseOrderByStartDateDesc()
                        .stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Aucune annee academique active trouvee"));

        if (applicationRepository.existsByEmailAndAcademicYearIdAndProgramIdAndArchivedFalse(
                request.email(), academicYear.getId(), program.getId())) {
            throw new DuplicateResourceException(
                    "Une candidature existe deja pour cet email dans ce programme et cette annee academique");
        }

        AdmissionApplication app = new AdmissionApplication();
        app.setApplicationNumber(generateApplicationNumber());
        app.setFirstName(request.firstName());
        app.setLastName(request.lastName());
        app.setEmail(request.email());
        app.setPhoneNumber(request.phoneNumber());
        app.setDateOfBirth(request.dateOfBirth());
        app.setGender(request.gender());
        app.setCityOfBirth(request.cityOfBirth());
        app.setCountryOfBirth(request.countryOfBirth());
        app.setDepartment(request.department());
        app.setPostalCode(request.postalCode());
        app.setNationality(request.nationality());
        app.setAddressLine(request.addressLine());
        app.setMotivationLetter(request.motivationLetter());
        // Parents
        app.setFatherName(request.fatherName());
        app.setFatherProfession(request.fatherProfession());
        app.setFatherCompany(request.fatherCompany());
        app.setFatherAddress(request.fatherAddress());
        app.setFatherCity(request.fatherCity());
        app.setFatherPhone(request.fatherPhone());
        app.setMotherName(request.motherName());
        app.setMotherProfession(request.motherProfession());
        app.setMotherCompany(request.motherCompany());
        app.setMotherAddress(request.motherAddress());
        app.setMotherCity(request.motherCity());
        app.setMotherPhone(request.motherPhone());
        // Parcours académique
        app.setEntryLevel(request.entryLevel());
        app.setPreviousDiplomaYear(request.previousDiplomaYear());
        app.setPreviousDiplomaTitle(request.previousDiplomaTitle());
        app.setPreviousSchool(request.previousSchool());
        app.setPreviousSchoolCity(request.previousSchoolCity());
        app.setPriority(request.priority() != null ? request.priority() : ApplicationPriority.NORMAL);
        app.setStatus(ApplicationStatus.DRAFT);
        app.setProgram(program);
        app.setAcademicYear(academicYear);

        AdmissionApplication saved = applicationRepository.save(app);
        // M17 — Email confirmation de réception de candidature
        emailService.sendAdmissionConfirmation(saved.getEmail(), saved.getFirstName(), saved.getApplicationNumber());
        return toFullResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdmissionApplicationSummaryResponse> getAll(ApplicationStatus status, Pageable pageable) {
        Page<AdmissionApplication> page = (status != null)
                ? applicationRepository.findByStatusAndArchivedFalseOrderByPriorityDescCreatedAtDesc(status, pageable)
                : applicationRepository.findByArchivedFalseOrderByCreatedAtDesc(pageable);
        return page.map(this::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AdmissionApplicationResponse getById(Long id) {
        return toFullResponse(findActive(id));
    }

    @Override
    public AdmissionApplicationResponse update(Long id, AdmissionApplicationUpdateRequest request) {
        AdmissionApplication app = findActive(id);

        app.setFirstName(request.firstName());
        app.setLastName(request.lastName());
        app.setMiddleName(request.middleName());
        app.setEmail(request.email());
        app.setPhoneNumber(request.phoneNumber());
        app.setSecondaryPhoneNumber(request.secondaryPhoneNumber());
        app.setDateOfBirth(request.dateOfBirth());
        app.setNationality(request.nationality());
        app.setGender(request.gender());
        app.setCityOfBirth(request.cityOfBirth());
        app.setCountryOfBirth(request.countryOfBirth());
        app.setDepartment(request.department());
        app.setNationalIdNumber(request.nationalIdNumber());
        app.setPassportNumber(request.passportNumber());
        app.setAddressLine(request.addressLine());
        app.setCity(request.city());
        app.setCountry(request.country());
        app.setPostalCode(request.postalCode());
        app.setMotivationLetter(request.motivationLetter());
        // Parents
        app.setFatherName(request.fatherName());
        app.setFatherProfession(request.fatherProfession());
        app.setFatherCompany(request.fatherCompany());
        app.setFatherAddress(request.fatherAddress());
        app.setFatherCity(request.fatherCity());
        app.setFatherPhone(request.fatherPhone());
        app.setMotherName(request.motherName());
        app.setMotherProfession(request.motherProfession());
        app.setMotherCompany(request.motherCompany());
        app.setMotherAddress(request.motherAddress());
        app.setMotherCity(request.motherCity());
        app.setMotherPhone(request.motherPhone());
        // Parcours académique
        app.setEntryLevel(request.entryLevel());
        app.setPreviousDiplomaYear(request.previousDiplomaYear());
        app.setPreviousDiplomaTitle(request.previousDiplomaTitle());
        app.setPreviousSchool(request.previousSchool());
        app.setPreviousSchoolCity(request.previousSchoolCity());

        if (request.priority() != null) {
            app.setPriority(request.priority());
        }

        return toFullResponse(applicationRepository.save(app));
    }

    @Override
    public void archive(Long id) {
        AdmissionApplication app = findActive(id);
        app.setArchived(true);
        applicationRepository.save(app);
    }

    // ─────────────────────── WORKFLOW / STATE MACHINE ───────────────────────

    @Override
    public AdmissionApplicationResponse changeStatus(Long id, AdmissionStatusChangeRequest request) {
        AdmissionApplication app = findActive(id);
        ApplicationStatus current = app.getStatus();
        ApplicationStatus target = request.targetStatus();

        validateTransition(current, target);

        switch (target) {
            case PENDING_REVIEW -> {
                app.setSubmittedAt(LocalDateTime.now());
            }
            case UNDER_REVIEW -> {
                // prise en charge par un gestionnaire
            }
            case VALIDATED -> {
                app.setDecidedAt(LocalDateTime.now());
                app.setRejectionReason(null);
                if (request.cohortId() != null) {
                    app.setCohort(findCohort(request.cohortId()));
                }
                if (request.reason() != null) {
                    app.setReviewNotes(request.reason());
                }
            }
            case REJECTED -> {
                app.setDecidedAt(LocalDateTime.now());
                if (request.reason() == null || request.reason().isBlank()) {
                    throw new IllegalArgumentException("Un motif de rejet est obligatoire");
                }
                app.setRejectionReason(request.reason());
            }
            case ENROLLED -> {
                if (app.getCohort() == null && request.cohortId() != null) {
                    app.setCohort(findCohort(request.cohortId()));
                }
                Student student = enrollStudent(app);
                app.setStudent(student);
            }
            default -> throw new IllegalArgumentException("Transition vers le statut " + target + " non geree");
        }

        app.setStatus(target);
        AdmissionApplication saved = applicationRepository.save(app);

        // M17 — Notification de changement de statut
        if (target == ApplicationStatus.VALIDATED || target == ApplicationStatus.REJECTED || target == ApplicationStatus.ENROLLED) {
            emailService.sendAdmissionConfirmation(saved.getEmail(), saved.getFirstName(), saved.getApplicationNumber());
        }
        return toFullResponse(saved);
    }

    // ─────────────────────── DOCUMENTS ──────────────────────────────────────

    @Override
    public SupportingDocumentResponse uploadDocument(Long applicationId, String documentType, MultipartFile file) {
        AdmissionApplication app = findActive(applicationId);

        if (app.getStatus() != ApplicationStatus.DRAFT && app.getStatus() != ApplicationStatus.PENDING_REVIEW) {
            throw new IllegalArgumentException(
                    "Les documents ne peuvent etre uploades qu'en statut DRAFT ou PENDING_REVIEW");
        }

        DocumentType type;
        try {
            type = DocumentType.valueOf(documentType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Type de document invalide : " + documentType);
        }

        String storagePath = storeFile(file, "admissions/" + applicationId);

        SupportingDocument doc = new SupportingDocument();
        doc.setApplication(app);
        doc.setDocumentType(type);
        doc.setFileName(file.getOriginalFilename());
        doc.setStoragePath(storagePath);
        doc.setContentType(file.getContentType());
        doc.setFileSizeBytes(file.getSize());

        return toDocumentResponse(documentRepository.save(doc));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportingDocumentResponse> getDocuments(Long applicationId) {
        findActive(applicationId);
        return documentRepository
                .findByApplicationIdAndArchivedFalseOrderByCreatedAtAsc(applicationId)
                .stream()
                .map(this::toDocumentResponse)
                .toList();
    }

    @Override
    public void deleteDocument(Long documentId) {
        SupportingDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable avec l'id : " + documentId));
        doc.setArchived(true);
        documentRepository.save(doc);
    }

    @Override
    public SupportingDocumentResponse verifyDocument(Long documentId, DocumentVerificationRequest request) {
        SupportingDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable avec l'id : " + documentId));
        doc.setVerified(request.verified());
        doc.setVerificationNote(request.verificationNote());
        return toDocumentResponse(documentRepository.save(doc));
    }

    // ─────────────────────── NOTES ──────────────────────────────────────────

    @Override
    public AdmissionNoteResponse addNote(Long applicationId, AdmissionNoteCreateRequest request) {
        AdmissionApplication app = findActive(applicationId);
        AdmissionNote note = new AdmissionNote();
        note.setApplication(app);
        note.setContent(request.content());
        note.setInternalOnly(request.internalOnly());
        return toNoteResponse(noteRepository.save(note));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdmissionNoteResponse> getNotes(Long applicationId, boolean includeInternal) {
        findActive(applicationId);
        List<AdmissionNote> notes = includeInternal
                ? noteRepository.findByApplicationIdAndArchivedFalseOrderByCreatedAtDesc(applicationId)
                : noteRepository.findByApplicationIdAndInternalOnlyFalseAndArchivedFalseOrderByCreatedAtDesc(applicationId);
        return notes.stream().map(this::toNoteResponse).toList();
    }

    // ─────────────────────── PRIVATE HELPERS ────────────────────────────────

    private void validateTransition(ApplicationStatus current, ApplicationStatus target) {
        // Un dossier peut être rejeté depuis n'importe quel état actif
        if (target == ApplicationStatus.REJECTED) {
            if (current == ApplicationStatus.REJECTED || current == ApplicationStatus.ENROLLED) {
                throw new IllegalArgumentException(
                        "Impossible de rejeter un dossier deja en statut " + current);
            }
            return;
        }

        boolean valid = switch (current) {
            case DRAFT -> target == ApplicationStatus.PENDING_REVIEW;
            case PENDING_REVIEW -> target == ApplicationStatus.UNDER_REVIEW;
            case UNDER_REVIEW -> target == ApplicationStatus.VALIDATED;
            case VALIDATED -> target == ApplicationStatus.ENROLLED;
            case REJECTED, ENROLLED -> false;
        };

        if (!valid) {
            throw new IllegalArgumentException(
                    "Transition invalide : " + current + " -> " + target);
        }
    }

    private Student enrollStudent(AdmissionApplication app) {
        // Générer un numéro d'étudiant unique
        String studentNumber = generateStudentNumber(app);

        if (studentRepository.existsByStudentNumberIgnoreCase(studentNumber)) {
            studentNumber = studentNumber + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        }

        // Créer ou récupérer un compte User pour l'étudiant
        User user = userRepository.findByEmail(app.getEmail()).orElse(null);
        if (user == null) {
            user = new User();
            user.setFirstName(app.getFirstName());
            user.setLastName(app.getLastName());
            user.setEmail(app.getEmail());
            user.setPhoneNumber(app.getPhoneNumber());
            user.setRole(UserRole.STUDENT);
            user.setStatus(UserStatus.ACTIVE);
            // Mot de passe temporaire : prénom.numéroEtudiant — l'étudiant devra le changer
            String firstName = app.getFirstName() != null ? app.getFirstName() : "etudiant";
            String tempPassword = firstName.toLowerCase() + "." + studentNumber;
            user.setPassword(passwordEncoder.encode(tempPassword));
            user.setUserCode(studentNumber);
            user = userRepository.save(user);
        } else {
            // Si l'utilisateur existe déjà, on s'assure qu'il a le rôle STUDENT
            user.setRole(UserRole.STUDENT);
            user = userRepository.save(user);
        }
        User savedUser = user;

        // Si un profil étudiant existe déjà pour cet utilisateur, le réutiliser
        if (studentRepository.existsByUserId(savedUser.getId())) {
            return studentRepository.findByUserId(savedUser.getId()).get();
        }

        // Créer le profil étudiant
        Student student = new Student();
        student.setStudentNumber(studentNumber);
        student.setAdmissionNumber(app.getApplicationNumber());
        student.setFirstName(app.getFirstName());
        student.setLastName(app.getLastName());
        student.setMiddleName(app.getMiddleName());
        student.setEmail(app.getEmail());
        student.setPhoneNumber(app.getPhoneNumber());
        student.setSecondaryPhoneNumber(app.getSecondaryPhoneNumber());
        student.setDateOfBirth(app.getDateOfBirth());
        student.setNationality(app.getNationality());
        student.setGender(app.getGender());
        student.setCityOfBirth(app.getCityOfBirth());
        student.setCountryOfBirth(app.getCountryOfBirth());
        student.setNationalIdNumber(app.getNationalIdNumber());
        student.setPassportNumber(app.getPassportNumber());
        student.setAddressLine(app.getAddressLine());
        student.setCity(app.getCity());
        student.setCountry(app.getCountry());
        student.setPostalCode(app.getPostalCode());
        student.setAdmissionDate(LocalDate.now());
        student.setStatus(StudentStatus.ACTIVE);
        student.setEnrollmentType(EnrollmentType.NEW_ADMISSION);
        
        // Generate automatic registration number (distinct from student number)
        String year = String.valueOf(LocalDate.now().getYear());
        long regCount = studentRepository.count() + 1;
        student.setRegistrationNumber(String.format("REG-%s-%05d", year, regCount));
        
        student.setUser(savedUser);
        student.setAcademicYear(app.getAcademicYear());
        student.setProgram(app.getProgram());
        student.setCohort(app.getCohort());
        
        // Attribution automatique de classe
        student.setClassRoom(classRoomService.getOrCreateAvailableClassRoom(app.getProgram(), app.getAcademicYear(), app.getCohort()));

        return studentRepository.save(student);
    }

    private String generateApplicationNumber() {
        int year = Year.now().getValue();
        String prefix = String.format("ADM-%d-", year);
        
        // Récupérer le dernier numéro de candidature pour cette année
        String lastNumber = applicationRepository.findTopByApplicationNumberStartingWithOrderByApplicationNumberDesc(prefix)
                .map(AdmissionApplication::getApplicationNumber)
                .orElse(null);
        
        long nextSeq = 1;
        if (lastNumber != null) {
            try {
                // Extraire le numéro de séquence du dernier numéro
                String seqStr = lastNumber.substring(prefix.length());
                nextSeq = Long.parseLong(seqStr) + 1;
            } catch (NumberFormatException e) {
                // En cas d'erreur de parsing, utiliser le count + sequence
                nextSeq = applicationRepository.count() + SEQUENCE.getAndIncrement();
            }
        }
        
        // Générer le numéro et vérifier qu'il n'existe pas déjà
        String applicationNumber;
        int maxAttempts = 100;
        int attempts = 0;
        do {
            applicationNumber = String.format("%s%05d", prefix, nextSeq);
            nextSeq++;
            attempts++;
            if (attempts > maxAttempts) {
                throw new IllegalStateException("Impossible de générer un numéro de candidature unique après " + maxAttempts + " tentatives");
            }
        } while (applicationRepository.existsByApplicationNumber(applicationNumber));
        
        return applicationNumber;
    }

    private String generateStudentNumber(AdmissionApplication app) {
        int year = Year.now().getValue();
        long count = studentRepository.count() + 1;
        return String.format("ETU-%d-%05d", year, count);
    }

    private String storeFile(MultipartFile file, String subDir) {
        try {
            Path uploadPath = Paths.get(baseDir, subDir);
            Files.createDirectories(uploadPath);
            String uniqueFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path destination = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return subDir + "/" + uniqueFileName;
        } catch (IOException e) {
            throw new FileStorageException("Erreur lors du stockage du fichier : " + e.getMessage());
        }
    }

    private AdmissionApplication findActive(Long id) {
        AdmissionApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature introuvable avec l'id : " + id));
        if (app.isArchived()) {
            throw new ResourceNotFoundException("Candidature introuvable avec l'id : " + id);
        }
        return app;
    }

    private Program findProgram(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programme introuvable avec l'id : " + id));
    }

    private AcademicYear findAcademicYear(Long id) {
        return academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Annee academique introuvable avec l'id : " + id));
    }

    private Cohort findCohort(Long id) {
        return cohortRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cohorte introuvable avec l'id : " + id));
    }

    // ─────────────────────── MAPPERS ────────────────────────────────────────

    private AdmissionApplicationResponse toFullResponse(AdmissionApplication app) {
        List<SupportingDocumentResponse> docs = documentRepository
                .findByApplicationIdAndArchivedFalseOrderByCreatedAtAsc(app.getId())
                .stream().map(this::toDocumentResponse).toList();

        List<AdmissionNoteResponse> notes = noteRepository
                .findByApplicationIdAndArchivedFalseOrderByCreatedAtDesc(app.getId())
                .stream().map(this::toNoteResponse).toList();

        return new AdmissionApplicationResponse(
                app.getId(),
                app.getApplicationNumber(),
                app.getFirstName(),
                app.getLastName(),
                app.getEmail(),
                app.getPhoneNumber(),
                app.getDateOfBirth(),
                app.getGender(),
                app.getCityOfBirth(),
                app.getCountryOfBirth(),
                app.getDepartment(),
                app.getPostalCode(),
                app.getNationality(),
                app.getAddressLine(),
                app.getMotivationLetter(),
                app.getFatherName(),
                app.getFatherProfession(),
                app.getFatherCompany(),
                app.getFatherAddress(),
                app.getFatherCity(),
                app.getFatherPhone(),
                app.getMotherName(),
                app.getMotherProfession(),
                app.getMotherCompany(),
                app.getMotherAddress(),
                app.getMotherCity(),
                app.getMotherPhone(),
                app.getEntryLevel(),
                app.getPreviousDiplomaYear(),
                app.getPreviousDiplomaTitle(),
                app.getPreviousSchool(),
                app.getPreviousSchoolCity(),
                app.getStatus(),
                app.getPriority(),
                app.getRejectionReason(),
                app.getReviewNotes(),
                app.getSubmittedAt(),
                app.getDecidedAt(),
                app.getProgram().getId(),
                app.getProgram().getName(),
                app.getAcademicYear().getId(),
                app.getAcademicYear().getName(),
                app.getCohort() != null ? app.getCohort().getId() : null,
                app.getCohort() != null ? app.getCohort().getName() : null,
                app.getStudent() != null ? app.getStudent().getId() : null,
                app.getStudent() != null ? app.getStudent().getStudentNumber() : null,
                docs,
                notes,
                app.getCreatedAt(),
                app.getUpdatedAt(),
                app.getCreatedBy(),
                app.getUpdatedBy()
        );
    }

    private AdmissionApplicationSummaryResponse toSummaryResponse(AdmissionApplication app) {
        return new AdmissionApplicationSummaryResponse(
                app.getId(),
                app.getApplicationNumber(),
                app.getFirstName(),
                app.getLastName(),
                app.getEmail(),
                app.getStatus(),
                app.getPriority(),
                app.getProgram().getName(),
                app.getAcademicYear().getName(),
                app.getSubmittedAt(),
                app.getCreatedAt()
        );
    }

    private SupportingDocumentResponse toDocumentResponse(SupportingDocument doc) {
        return new SupportingDocumentResponse(
                doc.getId(),
                doc.getDocumentType(),
                doc.getFileName(),
                doc.getStoragePath(),
                doc.getContentType(),
                doc.getFileSizeBytes(),
                doc.isVerified(),
                doc.getVerificationNote(),
                doc.getCreatedAt(),
                doc.getCreatedBy()
        );
    }

    private AdmissionNoteResponse toNoteResponse(AdmissionNote note) {
        return new AdmissionNoteResponse(
                note.getId(),
                note.getContent(),
                note.isInternalOnly(),
                note.getCreatedAt(),
                note.getCreatedBy()
        );
    }
}
