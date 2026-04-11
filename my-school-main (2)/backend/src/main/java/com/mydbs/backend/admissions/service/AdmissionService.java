package com.mydbs.backend.admissions.service;

import com.mydbs.backend.admissions.dto.*;
import com.mydbs.backend.admissions.model.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AdmissionService {

    AdmissionApplicationResponse create(AdmissionApplicationCreateRequest request);

    Page<AdmissionApplicationSummaryResponse> getAll(ApplicationStatus status, Pageable pageable);

    AdmissionApplicationResponse getById(Long id);

    AdmissionApplicationResponse update(Long id, AdmissionApplicationUpdateRequest request);

    AdmissionApplicationResponse changeStatus(Long id, AdmissionStatusChangeRequest request);

    void archive(Long id);

    SupportingDocumentResponse uploadDocument(Long applicationId, String documentType, MultipartFile file);

    List<SupportingDocumentResponse> getDocuments(Long applicationId);

    void deleteDocument(Long documentId);

    SupportingDocumentResponse verifyDocument(Long documentId, DocumentVerificationRequest request);

    AdmissionNoteResponse addNote(Long applicationId, AdmissionNoteCreateRequest request);

    List<AdmissionNoteResponse> getNotes(Long applicationId, boolean includeInternal);
}
