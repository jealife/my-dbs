-- ============================================================
-- V1_0_1__create_admissions_tables.sql
-- Module : Admissions & Inscriptions
-- Auteur : MyDBS Backend
-- Date   : 2026-03-24
-- ============================================================

-- Table principale des candidatures
CREATE TABLE IF NOT EXISTS admission_applications (
    id                 BIGINT          NOT NULL AUTO_INCREMENT,
    application_number VARCHAR(50)     NOT NULL,
    first_name         VARCHAR(120)    NOT NULL,
    last_name          VARCHAR(120)    NOT NULL,
    email              VARCHAR(180)    NOT NULL,
    phone_number       VARCHAR(40),
    date_of_birth      DATE,
    nationality        VARCHAR(80),
    gender             VARCHAR(30),
    address_line       VARCHAR(255),
    motivation_letter  TEXT,
    status             VARCHAR(30)     NOT NULL DEFAULT 'DRAFT',
    priority           VARCHAR(20)     NOT NULL DEFAULT 'NORMAL',
    rejection_reason   TEXT,
    review_notes       TEXT,
    submitted_at       DATETIME,
    decided_at         DATETIME,
    program_id         BIGINT          NOT NULL,
    academic_year_id   BIGINT          NOT NULL,
    cohort_id          BIGINT,
    student_id         BIGINT,
    -- Champs d'audit (BaseAuditEntity)
    created_at         DATETIME        NOT NULL,
    updated_at         DATETIME,
    created_by         VARCHAR(150),
    updated_by         VARCHAR(150),
    archived           TINYINT(1)      NOT NULL DEFAULT 0,

    CONSTRAINT pk_admission_applications PRIMARY KEY (id),
    CONSTRAINT uk_admission_application_number UNIQUE (application_number),
    CONSTRAINT fk_admission_program
        FOREIGN KEY (program_id) REFERENCES programs(id),
    CONSTRAINT fk_admission_academic_year
        FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    CONSTRAINT fk_admission_cohort
        FOREIGN KEY (cohort_id) REFERENCES cohorts(id),
    CONSTRAINT fk_admission_student
        FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'admission_applications'
      AND index_name = 'idx_admission_status'
);
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_admission_status ON admission_applications(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'admission_applications'
      AND index_name = 'idx_admission_email'
);
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_admission_email ON admission_applications(email)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'admission_applications'
      AND index_name = 'idx_admission_academic_year'
);
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_admission_academic_year ON admission_applications(academic_year_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'admission_applications'
      AND index_name = 'idx_admission_program'
);
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_admission_program ON admission_applications(program_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'admission_applications'
      AND index_name = 'idx_admission_priority'
);
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_admission_priority ON admission_applications(priority)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'admission_applications'
      AND index_name = 'idx_admission_archived'
);
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_admission_archived ON admission_applications(archived)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Table des pièces justificatives
CREATE TABLE IF NOT EXISTS supporting_documents (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    application_id    BIGINT        NOT NULL,
    document_type     VARCHAR(30)   NOT NULL,
    file_name         VARCHAR(255)  NOT NULL,
    storage_path      TEXT NOT NULL,
    content_type      VARCHAR(100),
    file_size_bytes   BIGINT,
    verified          TINYINT(1)    NOT NULL DEFAULT 0,
    verification_note TEXT,
    -- Champs d'audit (BaseAuditEntity)
    created_at        DATETIME      NOT NULL,
    updated_at        DATETIME,
    created_by        VARCHAR(150),
    updated_by        VARCHAR(150),
    archived          TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_supporting_documents PRIMARY KEY (id),
    CONSTRAINT fk_supporting_doc_application
        FOREIGN KEY (application_id) REFERENCES admission_applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'supporting_documents'
      AND index_name = 'idx_supporting_doc_application'
);
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_supporting_doc_application ON supporting_documents(application_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'supporting_documents'
      AND index_name = 'idx_supporting_doc_type'
);
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_supporting_doc_type ON supporting_documents(document_type)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Table des notes / commentaires internes
CREATE TABLE IF NOT EXISTS admission_notes (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    application_id BIGINT       NOT NULL,
    content        TEXT         NOT NULL,
    internal_only  TINYINT(1)   NOT NULL DEFAULT 1,
    -- Champs d'audit (BaseAuditEntity)
    created_at     DATETIME     NOT NULL,
    updated_at     DATETIME,
    created_by     VARCHAR(150),
    updated_by     VARCHAR(150),
    archived       TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_admission_notes PRIMARY KEY (id),
    CONSTRAINT fk_admission_note_application
        FOREIGN KEY (application_id) REFERENCES admission_applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'admission_notes'
      AND index_name = 'idx_admission_note_application'
);
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_admission_note_application ON admission_notes(application_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
