package com.mydbs.backend.admissions.dto;

import com.mydbs.backend.admissions.model.DocumentType;

import java.time.LocalDateTime;

public record SupportingDocumentResponse(
        Long id,
        DocumentType documentType,
        String fileName,
        String storagePath,
        String contentType,
        Long fileSizeBytes,
        boolean verified,
        String verificationNote,
        LocalDateTime createdAt,
        String createdBy
) {}
