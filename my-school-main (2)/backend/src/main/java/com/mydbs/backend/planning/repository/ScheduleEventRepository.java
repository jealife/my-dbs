package com.mydbs.backend.planning.repository;

import com.mydbs.backend.planning.model.ScheduleEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ScheduleEventRepository extends JpaRepository<ScheduleEvent, Long> {

    /** Agenda personnel d'un utilisateur (étudiant ou enseignant) sur une plage de dates */
    @Query("SELECT e FROM ScheduleEvent e WHERE e.archived = false AND e.status != 'CANCELLED' " +
           "AND (e.userId = :userId OR e.teacherId = :userId) " +
           "AND e.startAt >= :from AND e.startAt <= :to " +
           "ORDER BY e.startAt ASC")
    List<ScheduleEvent> findByUserIdAndDateRange(@Param("userId") Long userId,
                                                  @Param("from") LocalDateTime from,
                                                  @Param("to") LocalDateTime to);

    /** Agenda complet d'une cohorte sur une plage de dates */
    @Query("SELECT e FROM ScheduleEvent e WHERE e.archived = false AND e.status != 'CANCELLED' " +
           "AND e.cohortId = :cohortId " +
           "AND e.startAt >= :from AND e.startAt <= :to " +
           "ORDER BY e.startAt ASC")
    List<ScheduleEvent> findByCohortIdAndDateRange(@Param("cohortId") Long cohortId,
                                                    @Param("from") LocalDateTime from,
                                                    @Param("to") LocalDateTime to);

    /** Détection de conflits (overlap) pour un enseignant */
    @Query("SELECT e FROM ScheduleEvent e WHERE e.archived = false AND e.status = 'ACTIVE' " +
           "AND e.teacherId = :teacherId " +
           "AND e.startAt < :endAt AND e.endAt > :startAt")
    List<ScheduleEvent> findConflictsForTeacher(@Param("teacherId") Long teacherId,
                                                 @Param("startAt") LocalDateTime startAt,
                                                 @Param("endAt") LocalDateTime endAt);

    /** Détection de conflits pour un utilisateur */
    @Query("SELECT e FROM ScheduleEvent e WHERE e.archived = false AND e.status = 'ACTIVE' " +
           "AND e.userId = :userId " +
           "AND e.startAt < :endAt AND e.endAt > :startAt")
    List<ScheduleEvent> findConflictsForUser(@Param("userId") Long userId,
                                              @Param("startAt") LocalDateTime startAt,
                                              @Param("endAt") LocalDateTime endAt);

    List<ScheduleEvent> findByTeacherIdAndArchivedFalseOrderByStartAtAsc(Long teacherId);
}
