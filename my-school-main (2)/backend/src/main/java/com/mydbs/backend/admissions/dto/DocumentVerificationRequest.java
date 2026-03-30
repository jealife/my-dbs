package com.mydbs.backend.admissions.dto;

public record DocumentVerificationRequest(
        boolean verified,
        String verificationNote
) {}
