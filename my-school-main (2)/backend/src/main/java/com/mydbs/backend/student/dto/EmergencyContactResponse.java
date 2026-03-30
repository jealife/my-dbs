package com.mydbs.backend.student.dto;

import java.time.LocalDateTime;

public record EmergencyContactResponse(
        Long id,
        String fullName,
        String relationshipLabel,
        String phoneNumber,
        String secondaryPhoneNumber,
        String email,
        String addressLine,
        Integer priorityOrder,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}