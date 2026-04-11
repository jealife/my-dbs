package com.mydbs.backend.admissions.dto;

import java.time.LocalDateTime;

public record AdmissionNoteResponse(
        Long id,
        String content,
        boolean internalOnly,
        LocalDateTime createdAt,
        String createdBy
) {}
