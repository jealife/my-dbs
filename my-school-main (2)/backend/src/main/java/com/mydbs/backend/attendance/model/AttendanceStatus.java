package com.mydbs.backend.attendance.model;

public enum AttendanceStatus {
    PRESENT,   // Présent
    ABSENT,    // Absent non justifié
    LATE,      // En retard
    EXCUSED,   // Absent justifié (après validation)
    REMOTE     // Présence à distance (cours hybride)
}
