-- ============================================================
-- V1_0_13__create_competence_tables.sql
-- Module : Compétences & Badges (Section 4.14 CdC)
-- Auteur : MyDBS Backend
-- Date   : 2026-03-24
-- ============================================================

-- Référentiel de compétences
CREATE TABLE IF NOT EXISTS competences (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    code            VARCHAR(50)  NOT NULL,
    title           VARCHAR(300) NOT NULL,
    description     TEXT,
    domain          VARCHAR(150),
    expected_level  VARCHAR(20),
    program_id      BIGINT,
    created_at      DATETIME     NOT NULL,
    updated_at      DATETIME,
    created_by      VARCHAR(150),
    updated_by      VARCHAR(150),
    archived        TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_competences PRIMARY KEY (id),
    CONSTRAINT uk_competence_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'competences' AND index_name = 'idx_competence_domain');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_competence_domain ON competences(domain)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'competences' AND index_name = 'idx_competence_program');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_competence_program ON competences(program_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Acquisitions de compétences par les étudiants
CREATE TABLE IF NOT EXISTS competence_acquisitions (
    id                   BIGINT       NOT NULL AUTO_INCREMENT,
    student_id           BIGINT       NOT NULL,
    competence_id        BIGINT       NOT NULL,
    acquired_level       VARCHAR(20)  NOT NULL,
    validated_by_id      BIGINT,
    validated_at         DATE,
    evidence_description VARCHAR(1000),
    created_at           DATETIME     NOT NULL,
    updated_at           DATETIME,
    created_by           VARCHAR(150),
    updated_by           VARCHAR(150),
    archived             TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_competence_acquisitions PRIMARY KEY (id),
    CONSTRAINT uk_acquisition_student_competence UNIQUE (student_id, competence_id),
    CONSTRAINT fk_acquisition_competence FOREIGN KEY (competence_id) REFERENCES competences(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'competence_acquisitions' AND index_name = 'idx_acquisition_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_acquisition_student ON competence_acquisitions(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'competence_acquisitions' AND index_name = 'idx_acquisition_competence');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_acquisition_competence ON competence_acquisitions(competence_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Badges numériques
CREATE TABLE IF NOT EXISTS badges (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    title           VARCHAR(200)  NOT NULL,
    description     VARCHAR(1000),
    icon_url        VARCHAR(500),
    category        VARCHAR(100),
    points          INT           NOT NULL DEFAULT 0,
    award_criteria  VARCHAR(1000),
    auto_award      TINYINT(1)    NOT NULL DEFAULT 0,
    created_at      DATETIME      NOT NULL,
    updated_at      DATETIME,
    created_by      VARCHAR(150),
    updated_by      VARCHAR(150),
    archived        TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_badges PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'badges' AND index_name = 'idx_badge_category');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_badge_category ON badges(category)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Attributions de badges
CREATE TABLE IF NOT EXISTS badge_awards (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    student_id    BIGINT       NOT NULL,
    badge_id      BIGINT       NOT NULL,
    awarded_at    DATE         NOT NULL,
    awarded_by_id BIGINT,
    award_reason  VARCHAR(500),
    created_at    DATETIME     NOT NULL,
    updated_at    DATETIME,
    created_by    VARCHAR(150),
    updated_by    VARCHAR(150),
    archived      TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_badge_awards PRIMARY KEY (id),
    CONSTRAINT uk_award_student_badge UNIQUE (student_id, badge_id),
    CONSTRAINT fk_award_badge FOREIGN KEY (badge_id) REFERENCES badges(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'badge_awards' AND index_name = 'idx_award_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_award_student ON badge_awards(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'badge_awards' AND index_name = 'idx_award_badge');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_award_badge ON badge_awards(badge_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
