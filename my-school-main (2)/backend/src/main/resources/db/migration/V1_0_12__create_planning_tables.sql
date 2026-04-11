-- ============================================================
-- V1_0_12__create_planning_tables.sql
-- Module : Planning & Agenda
-- Auteur : MyDBS Backend
-- Date   : 2026-03-24
-- ============================================================

CREATE TABLE IF NOT EXISTS schedule_events (
    id                  BIGINT        NOT NULL AUTO_INCREMENT,
    event_type          VARCHAR(30)   NOT NULL,
    title               VARCHAR(300)  NOT NULL,
    description         VARCHAR(2000),
    start_at            DATETIME      NOT NULL,
    end_at              DATETIME      NOT NULL,
    all_day             TINYINT(1)    NOT NULL DEFAULT 0,
    location            VARCHAR(300),
    meeting_link        VARCHAR(500),
    recurrence_rule     VARCHAR(300),
    user_id             BIGINT,
    cohort_id           BIGINT,
    teacher_id          BIGINT,
    reference_id        BIGINT,
    reference_type      VARCHAR(50),
    status              VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE',
    cancellation_reason VARCHAR(500),
    created_at          DATETIME      NOT NULL,
    updated_at          DATETIME,
    created_by          VARCHAR(150),
    updated_by          VARCHAR(150),
    archived            TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_schedule_events PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'schedule_events' AND index_name = 'idx_event_user');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_event_user ON schedule_events(user_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'schedule_events' AND index_name = 'idx_event_cohort');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_event_cohort ON schedule_events(cohort_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'schedule_events' AND index_name = 'idx_event_teacher');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_event_teacher ON schedule_events(teacher_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'schedule_events' AND index_name = 'idx_event_start');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_event_start ON schedule_events(start_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'schedule_events' AND index_name = 'idx_event_type');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_event_type ON schedule_events(event_type)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'schedule_events' AND index_name = 'idx_event_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_event_status ON schedule_events(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
