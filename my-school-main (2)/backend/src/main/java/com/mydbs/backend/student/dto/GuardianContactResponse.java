package com.mydbs.backend.student.dto;

import java.time.LocalDateTime;

public record GuardianContactResponse(
        Long id,
        String fullName,
        String relationshipLabel,
        String phoneNumber,
        String secondaryPhoneNumber,
        String email,
        String addressLine,
        String city,
        String country,
        boolean primaryContact,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}