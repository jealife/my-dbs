-- ============================================================
-- V1_0_9__create_mentoring_tables.sql
-- Module : Mentorat
-- Auteur : MyDBS Backend
-- Date   : 2026-03-24
-- ============================================================

CREATE TABLE IF NOT EXISTS mentorships (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    mentor_id        BIGINT       NOT NULL,
    mentee_id        BIGINT       NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    start_date       DATE,
    end_date         DATE,
    goals            VARCHAR(2000),
    academic_year_id BIGINT,
    created_at       DATETIME     NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_mentorships PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'mentorships' AND index_name = 'idx_mentorship_mentor');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_mentorship_mentor ON mentorships(mentor_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'mentorships' AND index_name = 'idx_mentorship_mentee');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_mentorship_mentee ON mentorships(mentee_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'mentorships' AND index_name = 'idx_mentorship_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_mentorship_status ON mentorships(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mentoring_sessions (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    mentorship_id  BIGINT       NOT NULL,
    session_date   DATE         NOT NULL,
    start_time     TIME,
    end_time       TIME,
    location       VARCHAR(200),
    notes          VARCHAR(2000),
    status         VARCHAR(20)  NOT NULL DEFAULT 'PLANNED',
    created_at     DATETIME     NOT NULL,
    updated_at     DATETIME,
    created_by     VARCHAR(150),
    updated_by     VARCHAR(150),
    archived       TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_mentoring_sessions PRIMARY KEY (id),
    CONSTRAINT fk_msession_mentorship FOREIGN KEY (mentorship_id) REFERENCES mentorships(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'mentoring_sessions' AND index_name = 'idx_msession_mentorship');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_msession_mentorship ON mentoring_sessions(mentorship_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'mentoring_sessions' AND index_name = 'idx_msession_date');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_msession_date ON mentoring_sessions(session_date)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS action_plans (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    mentorship_id  BIGINT       NOT NULL,
    title          VARCHAR(200) NOT NULL,
    description    VARCHAR(2000),
    due_date       DATE,
    completed      TINYINT(1)   NOT NULL DEFAULT 0,
    completed_at   DATE,
    created_at     DATETIME     NOT NULL,
    updated_at     DATETIME,
    created_by     VARCHAR(150),
    updated_by     VARCHAR(150),
    archived       TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_action_plans PRIMARY KEY (id),
    CONSTRAINT fk_plan_mentorship FOREIGN KEY (mentorship_id) REFERENCES mentorships(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'action_plans' AND index_name = 'idx_plan_mentorship');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_plan_mentorship ON action_plans(mentorship_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
