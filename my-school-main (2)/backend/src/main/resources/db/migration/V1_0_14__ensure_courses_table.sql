-- ============================================================
-- V1_0_14__ensure_courses_table.sql
-- Ensure core table `courses` exists (local DB might have been baselined)
-- ============================================================

CREATE TABLE IF NOT EXISTS courses (
    id                    BIGINT        NOT NULL AUTO_INCREMENT,
    title                 VARCHAR(180)  NOT NULL,
    code                  VARCHAR(40)   NOT NULL,
    course_sheet          TEXT,
    objectives            TEXT,
    prerequisites         TEXT,
    syllabus              TEXT,
    description           TEXT,
    credits               INT           NOT NULL,
    coefficient           DOUBLE        NOT NULL,
    total_hours           INT           NOT NULL,
    published             TINYINT(1)    NOT NULL DEFAULT 0,
    current_version_number INT          NOT NULL DEFAULT 1,
    status                VARCHAR(30)   NOT NULL,
    visibility            VARCHAR(30)   NOT NULL,
    academic_year_id      BIGINT        NOT NULL,
    program_id            BIGINT        NOT NULL,
    class_id              BIGINT,
    instructor_user_id    BIGINT,
    created_at            DATETIME      NOT NULL,
    updated_at            DATETIME,
    created_by            VARCHAR(150),
    updated_by            VARCHAR(150),
    archived              TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_courses PRIMARY KEY (id),
    CONSTRAINT uk_courses_code UNIQUE (code),
    CONSTRAINT fk_course_academic_year   FOREIGN KEY (academic_year_id)   REFERENCES academic_years(id),
    CONSTRAINT fk_course_program         FOREIGN KEY (program_id)         REFERENCES programs(id),
    CONSTRAINT fk_course_class           FOREIGN KEY (class_id)           REFERENCES classes(id),
    CONSTRAINT fk_course_instructor_user FOREIGN KEY (instructor_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'courses' AND index_name = 'idx_courses_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_courses_status ON courses(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'courses' AND index_name = 'idx_courses_program');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_courses_program ON courses(program_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'courses' AND index_name = 'idx_courses_class');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_courses_class ON courses(class_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'courses' AND index_name = 'idx_courses_year');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_courses_year ON courses(academic_year_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
