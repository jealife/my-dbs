package com.mydbs.backend.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record JustificationCreateRequest(
        @NotNull Long studentId,
        Long attendanceRecordId,          // optionnel : lie à un enregistrement précis

        @NotBlank String reason,

        @NotNull LocalDate absenceDateFrom,
        @NotNull LocalDate absenceDateTo
) {}
