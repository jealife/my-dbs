-- ============================================================
-- V1_0_5__create_grades_tables.sql
-- Module : Notes & Bulletins
-- Auteur : MyDBS Backend
-- Date   : 2026-03-24
-- ============================================================

-- Table des carnets de notes
CREATE TABLE IF NOT EXISTS grade_books (
    id                   BIGINT       NOT NULL AUTO_INCREMENT,
    student_id           BIGINT       NOT NULL,
    course_id            BIGINT       NOT NULL,
    academic_year_id     BIGINT       NOT NULL,
    cohort_id            BIGINT,
    semester             VARCHAR(20),
    weighted_average     DOUBLE,
    credits              INT,
    coefficient          DOUBLE       NOT NULL DEFAULT 1.0,
    validated            TINYINT(1)   NOT NULL DEFAULT 0,
    passing_grade        DOUBLE       DEFAULT 10.0,
    teacher_appreciation VARCHAR(1000),
    -- Audit
    created_at           DATETIME     NOT NULL,
    updated_at           DATETIME,
    created_by           VARCHAR(150),
    updated_by           VARCHAR(150),
    archived             TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_grade_books PRIMARY KEY (id),
    CONSTRAINT uk_gradebook_student_course_year UNIQUE (student_id, course_id, academic_year_id),
    CONSTRAINT fk_gradebook_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_gradebook_course  FOREIGN KEY (course_id)  REFERENCES courses(id),
    CONSTRAINT fk_gradebook_year    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    CONSTRAINT fk_gradebook_cohort  FOREIGN KEY (cohort_id) REFERENCES cohorts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'grade_books' AND index_name = 'idx_gradebook_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_gradebook_student ON grade_books(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'grade_books' AND index_name = 'idx_gradebook_course');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_gradebook_course ON grade_books(course_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'grade_books' AND index_name = 'idx_gradebook_year');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_gradebook_year ON grade_books(academic_year_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Table des notes individuelles
CREATE TABLE IF NOT EXISTS grade_items (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    grade_book_id    BIGINT        NOT NULL,
    item_type        VARCHAR(20)   NOT NULL,
    source_id        BIGINT,
    label            VARCHAR(200)  NOT NULL,
    score            DOUBLE        NOT NULL,
    max_score        DOUBLE        NOT NULL DEFAULT 20.0,
    coefficient      DOUBLE        NOT NULL DEFAULT 1.0,
    semester         VARCHAR(20),
    teacher_comment  VARCHAR(500),
    -- Audit
    created_at       DATETIME      NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_grade_items PRIMARY KEY (id),
    CONSTRAINT fk_gradeitem_gradebook FOREIGN KEY (grade_book_id) REFERENCES grade_books(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'grade_items' AND index_name = 'idx_gradeitem_gradebook');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_gradeitem_gradebook ON grade_items(grade_book_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'grade_items' AND index_name = 'idx_gradeitem_type');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_gradeitem_type ON grade_items(item_type)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'grade_items' AND index_name = 'idx_gradeitem_source');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_gradeitem_source ON grade_items(source_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Table des bulletins
CREATE TABLE IF NOT EXISTS bulletins (
    id                        BIGINT        NOT NULL AUTO_INCREMENT,
    student_id                BIGINT        NOT NULL,
    academic_year_id          BIGINT        NOT NULL,
    cohort_id                 BIGINT,
    semester                  VARCHAR(20)   NOT NULL,
    status                    VARCHAR(20)   NOT NULL DEFAULT 'DRAFT',
    general_average           DOUBLE,
    total_credits_acquired    INT,
    total_credits_possible    INT,
    rank_in_cohort            INT,
    total_students_in_cohort  INT,
    class_average             DOUBLE,
    highest_average           DOUBLE,
    lowest_average            DOUBLE,
    head_teacher_comment      VARCHAR(1000),
    council_decision          VARCHAR(500),
    published_at              DATETIME,
    -- Audit
    created_at                DATETIME      NOT NULL,
    updated_at                DATETIME,
    created_by                VARCHAR(150),
    updated_by                VARCHAR(150),
    archived                  TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_bulletins PRIMARY KEY (id),
    CONSTRAINT uk_bulletin_student_semester_year UNIQUE (student_id, semester, academic_year_id),
    CONSTRAINT fk_bulletin_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_bulletin_year    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    CONSTRAINT fk_bulletin_cohort  FOREIGN KEY (cohort_id) REFERENCES cohorts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'bulletins' AND index_name = 'idx_bulletin_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_bulletin_student ON bulletins(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'bulletins' AND index_name = 'idx_bulletin_year');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_bulletin_year ON bulletins(academic_year_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'bulletins' AND index_name = 'idx_bulletin_cohort');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_bulletin_cohort ON bulletins(cohort_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'bulletins' AND index_name = 'idx_bulletin_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_bulletin_status ON bulletins(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Table des relevés de notes
CREATE TABLE IF NOT EXISTS transcripts (
    id                     BIGINT       NOT NULL AUTO_INCREMENT,
    student_id             BIGINT       NOT NULL,
    academic_year_id       BIGINT,
    reference_number       VARCHAR(50)  NOT NULL UNIQUE,
    general_average        DOUBLE,
    total_credits_acquired INT,
    total_credits_possible INT,
    issued_at              DATE         NOT NULL,
    file_path              VARCHAR(1000),
    type                   VARCHAR(30)  DEFAULT 'ANNUAL',
    -- Audit
    created_at             DATETIME     NOT NULL,
    updated_at             DATETIME,
    created_by             VARCHAR(150),
    updated_by             VARCHAR(150),
    archived               TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_transcripts PRIMARY KEY (id),
    CONSTRAINT fk_transcript_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_transcript_year    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'transcripts' AND index_name = 'idx_transcript_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_transcript_student ON transcripts(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Table des acquisitions de crédits ECTS
CREATE TABLE IF NOT EXISTS credit_acquisitions (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    student_id       BIGINT       NOT NULL,
    course_id        BIGINT       NOT NULL,
    academic_year_id BIGINT       NOT NULL,
    credits_earned   INT          NOT NULL,
    grade_obtained   DOUBLE,
    semester         VARCHAR(20),
    compensated      TINYINT(1)   NOT NULL DEFAULT 0,
    -- Audit
    created_at       DATETIME     NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_credit_acquisitions PRIMARY KEY (id),
    CONSTRAINT uk_credit_student_course_year UNIQUE (student_id, course_id, academic_year_id),
    CONSTRAINT fk_credit_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_credit_course  FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT fk_credit_year    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'credit_acquisitions' AND index_name = 'idx_credit_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_credit_student ON credit_acquisitions(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'credit_acquisitions' AND index_name = 'idx_credit_course');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_credit_course ON credit_acquisitions(course_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'credit_acquisitions' AND index_name = 'idx_credit_year');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_credit_year ON credit_acquisitions(academic_year_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
