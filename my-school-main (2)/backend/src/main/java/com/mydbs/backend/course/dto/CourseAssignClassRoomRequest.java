package com.mydbs.backend.course.dto;

/**
 * Corps de la requête PATCH /api/courses/{id}/classroom
 * Permet à un professeur d'associer (ou dissocier) une classe à son cours.
 * classRoomId = null  → dissocier la classe du cours
 */
public record CourseAssignClassRoomRequest(Long classRoomId) {
}
