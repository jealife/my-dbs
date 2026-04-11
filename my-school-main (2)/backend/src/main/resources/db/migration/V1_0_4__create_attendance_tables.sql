-- ============================================================
-- V1_0_4__create_attendance_tables.sql
-- Module : Présences & Assiduité
-- Auteur : MyDBS Backend
-- Date   : 2026-03-24
-- ============================================================

-- Table des enregistrements de présence
CREATE TABLE IF NOT EXISTS attendance_records (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    session_id      BIGINT       NOT NULL,
    student_id      BIGINT       NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ABSENT',
    arrival_time    TIME,
    late_minutes    INT,
    teacher_note    VARCHAR(500),
    -- Audit
    created_at      DATETIME     NOT NULL,
    updated_at      DATETIME,
    created_by      VARCHAR(150),
    updated_by      VARCHAR(150),
    archived        TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_attendance_records PRIMARY KEY (id),
    CONSTRAINT uk_attendance_session_student UNIQUE (session_id, student_id),
    CONSTRAINT fk_att_session  FOREIGN KEY (session_id)  REFERENCES course_sessions(id),
    CONSTRAINT fk_att_student  FOREIGN KEY (student_id)  REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'attendance_records' AND index_name = 'idx_att_session');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_att_session ON attendance_records(session_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'attendance_records' AND index_name = 'idx_att_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_att_student ON attendance_records(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'attendance_records' AND index_name = 'idx_att_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_att_status ON attendance_records(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'attendance_records' AND index_name = 'idx_att_archived');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_att_archived ON attendance_records(archived)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Table des justifications d'absence
CREATE TABLE IF NOT EXISTS attendance_justifications (
    id                    BIGINT        NOT NULL AUTO_INCREMENT,
    student_id            BIGINT        NOT NULL,
    attendance_record_id  BIGINT,
    reason                VARCHAR(2000) NOT NULL,
    absence_date_from     DATE          NOT NULL,
    absence_date_to       DATE          NOT NULL,
    document_path         VARCHAR(1000),
    document_name         VARCHAR(255),
    status                VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    reviewer_comment      VARCHAR(1000),
    -- Audit
    created_at            DATETIME      NOT NULL,
    updated_at            DATETIME,
    created_by            VARCHAR(150),
    updated_by            VARCHAR(150),
    archived              TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_attendance_justifications PRIMARY KEY (id),
    CONSTRAINT fk_justif_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_justif_record  FOREIGN KEY (attendance_record_id) REFERENCES attendance_records(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'attendance_justifications' AND index_name = 'idx_justif_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_justif_student ON attendance_justifications(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'attendance_justifications' AND index_name = 'idx_justif_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_justif_status ON attendance_justifications(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'attendance_justifications' AND index_name = 'idx_justif_dates');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_justif_dates ON attendance_justifications(absence_date_from)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'attendance_justifications' AND index_name = 'idx_justif_archived');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_justif_archived ON attendance_justifications(archived)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
