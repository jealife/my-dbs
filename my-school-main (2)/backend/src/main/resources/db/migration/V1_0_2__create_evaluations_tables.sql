-- ============================================================
-- V1_0_2__create_evaluations_tables.sql
-- Module : Évaluations & Examens
-- Auteur : MyDBS Backend
-- Date   : 2026-03-24
-- ============================================================

-- Table des évaluations
CREATE TABLE IF NOT EXISTS evaluations (
    id                    BIGINT        NOT NULL AUTO_INCREMENT,
    title                 VARCHAR(200)  NOT NULL,
    description           TEXT,
    evaluation_type       VARCHAR(40)   NOT NULL,
    status                VARCHAR(30)   NOT NULL DEFAULT 'DRAFT',
    max_score             DOUBLE        NOT NULL DEFAULT 20.0,
    passing_score         DOUBLE        NOT NULL DEFAULT 10.0,
    coefficient           DOUBLE        NOT NULL DEFAULT 1.0,
    weight_percentage     DOUBLE,
    scheduled_at          DATETIME,
    duration_minutes      INT,
    room_info             VARCHAR(200),
    instructions          TEXT,
    semester              VARCHAR(20),
    results_published_at  DATETIME,
    course_id             BIGINT        NOT NULL,
    academic_year_id      BIGINT        NOT NULL,
    cohort_id             BIGINT,
    class_id              BIGINT,
    created_by_user_id    BIGINT,
    -- Champs d'audit
    created_at            DATETIME      NOT NULL,
    updated_at            DATETIME,
    created_by            VARCHAR(150),
    updated_by            VARCHAR(150),
    archived              TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_evaluations PRIMARY KEY (id),
    CONSTRAINT fk_eval_course
        FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT fk_eval_academic_year
        FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    CONSTRAINT fk_eval_cohort
        FOREIGN KEY (cohort_id) REFERENCES cohorts(id),
    CONSTRAINT fk_eval_class
        FOREIGN KEY (class_id) REFERENCES classes(id),
    CONSTRAINT fk_eval_creator
        FOREIGN KEY (created_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'evaluations' AND index_name = 'idx_eval_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_eval_status ON evaluations(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'evaluations' AND index_name = 'idx_eval_course');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_eval_course ON evaluations(course_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'evaluations' AND index_name = 'idx_eval_cohort');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_eval_cohort ON evaluations(cohort_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'evaluations' AND index_name = 'idx_eval_year');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_eval_year ON evaluations(academic_year_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'evaluations' AND index_name = 'idx_eval_type');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_eval_type ON evaluations(evaluation_type)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'evaluations' AND index_name = 'idx_eval_archived');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_eval_archived ON evaluations(archived)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Table des résultats individuels
CREATE TABLE IF NOT EXISTS evaluation_results (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    evaluation_id    BIGINT        NOT NULL,
    student_id       BIGINT        NOT NULL,
    score            DOUBLE,
    max_score        DOUBLE        NOT NULL DEFAULT 20.0,
    status           VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    teacher_comment  TEXT,
    graded_at        DATETIME,
    is_compensated   TINYINT(1)    NOT NULL DEFAULT 0,
    -- Champs d'audit
    created_at       DATETIME      NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_evaluation_results PRIMARY KEY (id),
    CONSTRAINT uk_eval_result_eval_student UNIQUE (evaluation_id, student_id),
    CONSTRAINT fk_eval_result_evaluation
        FOREIGN KEY (evaluation_id) REFERENCES evaluations(id),
    CONSTRAINT fk_eval_result_student
        FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'evaluation_results' AND index_name = 'idx_eval_result_evaluation');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_eval_result_evaluation ON evaluation_results(evaluation_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'evaluation_results' AND index_name = 'idx_eval_result_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_eval_result_student ON evaluation_results(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'evaluation_results' AND index_name = 'idx_eval_result_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_eval_result_status ON evaluation_results(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Table des critères de notation (rubric)
CREATE TABLE IF NOT EXISTS rubric_criteria (
    id                 BIGINT        NOT NULL AUTO_INCREMENT,
    evaluation_id      BIGINT        NOT NULL,
    criterion_name     VARCHAR(200)  NOT NULL,
    description        TEXT,
    max_points         DOUBLE        NOT NULL,
    weight_percentage  DOUBLE        NOT NULL DEFAULT 100.0,
    order_index        INT           NOT NULL DEFAULT 0,
    -- Champs d'audit
    created_at         DATETIME      NOT NULL,
    updated_at         DATETIME,
    created_by         VARCHAR(150),
    updated_by         VARCHAR(150),
    archived           TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_rubric_criteria PRIMARY KEY (id),
    CONSTRAINT fk_rubric_evaluation
        FOREIGN KEY (evaluation_id) REFERENCES evaluations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'rubric_criteria' AND index_name = 'idx_rubric_evaluation');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_rubric_evaluation ON rubric_criteria(evaluation_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Table des délibérations (sessions de jury)
CREATE TABLE IF NOT EXISTS deliberations (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    title             VARCHAR(200)  NOT NULL,
    semester          VARCHAR(20),
    scheduled_at      DATETIME,
    closed_at         DATETIME,
    notes             TEXT,
    published         TINYINT(1)    NOT NULL DEFAULT 0,
    cohort_id         BIGINT        NOT NULL,
    academic_year_id  BIGINT        NOT NULL,
    president_user_id BIGINT,
    -- Champs d'audit
    created_at        DATETIME      NOT NULL,
    updated_at        DATETIME,
    created_by        VARCHAR(150),
    updated_by        VARCHAR(150),
    archived          TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_deliberations PRIMARY KEY (id),
    CONSTRAINT fk_delib_cohort
        FOREIGN KEY (cohort_id) REFERENCES cohorts(id),
    CONSTRAINT fk_delib_academic_year
        FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    CONSTRAINT fk_delib_president
        FOREIGN KEY (president_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'deliberations' AND index_name = 'idx_delib_cohort');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_delib_cohort ON deliberations(cohort_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'deliberations' AND index_name = 'idx_delib_year');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_delib_year ON deliberations(academic_year_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'deliberations' AND index_name = 'idx_delib_archived');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_delib_archived ON deliberations(archived)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
