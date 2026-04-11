-- ============================================================
-- V1_0_10__create_career_tables.sql
-- Module : Carrière & Portfolio
-- Auteur : MyDBS Backend
-- Date   : 2026-03-24
-- ============================================================

CREATE TABLE IF NOT EXISTS job_offers (
    id                    BIGINT        NOT NULL AUTO_INCREMENT,
    title                 VARCHAR(300)  NOT NULL,
    company_name          VARCHAR(200)  NOT NULL,
    description           TEXT          NOT NULL,
    offer_type            VARCHAR(30)   NOT NULL,
    location              VARCHAR(200),
    remote_possible       TINYINT(1)   NOT NULL DEFAULT 0,
    application_deadline  DATE,
    start_date            DATE,
    duration_months       INT,
    status                VARCHAR(20)   NOT NULL DEFAULT 'OPEN',
    contact_email         VARCHAR(150),
    program_ids           VARCHAR(500),
    posted_by_id          BIGINT,
    created_at            DATETIME     NOT NULL,
    updated_at            DATETIME,
    created_by            VARCHAR(150),
    updated_by            VARCHAR(150),
    archived              TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_job_offers PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'job_offers' AND index_name = 'idx_job_type');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_job_type ON job_offers(offer_type)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'job_offers' AND index_name = 'idx_job_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_job_status ON job_offers(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'job_offers' AND index_name = 'idx_job_deadline');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_job_deadline ON job_offers(application_deadline)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_applications (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    student_id       BIGINT       NOT NULL,
    job_offer_id     BIGINT       NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'SUBMITTED',
    cover_letter     TEXT,
    cv_file_path     VARCHAR(500),
    applied_at       DATE,
    recruiter_notes  VARCHAR(1000),
    created_at       DATETIME     NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_job_applications PRIMARY KEY (id),
    CONSTRAINT uk_application_student_offer UNIQUE (student_id, job_offer_id),
    CONSTRAINT fk_app_offer FOREIGN KEY (job_offer_id) REFERENCES job_offers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'job_applications' AND index_name = 'idx_app_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_app_student ON job_applications(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'job_applications' AND index_name = 'idx_app_offer');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_app_offer ON job_applications(job_offer_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'job_applications' AND index_name = 'idx_app_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_app_status ON job_applications(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS portfolio_projects (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    student_id        BIGINT        NOT NULL,
    title             VARCHAR(200)  NOT NULL,
    description       TEXT,
    project_url       VARCHAR(500),
    repository_url    VARCHAR(500),
    technologies      VARCHAR(500),
    start_date        DATE,
    end_date          DATE,
    publicly_visible  TINYINT(1)   NOT NULL DEFAULT 0,
    course_id         BIGINT,
    created_at        DATETIME     NOT NULL,
    updated_at        DATETIME,
    created_by        VARCHAR(150),
    updated_by        VARCHAR(150),
    archived          TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_portfolio_projects PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'portfolio_projects' AND index_name = 'idx_portfolio_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_portfolio_student ON portfolio_projects(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'portfolio_projects' AND index_name = 'idx_portfolio_visible');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_portfolio_visible ON portfolio_projects(publicly_visible)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
