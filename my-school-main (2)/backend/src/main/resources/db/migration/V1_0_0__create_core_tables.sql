-- ============================================================
-- V1_0_0__create_core_tables.sql
-- Core schema required by subsequent modules (FK targets)
-- ============================================================

-- Users (required by multiple modules + admin bootstrap)
CREATE TABLE IF NOT EXISTS users (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    user_code     VARCHAR(30)  NOT NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL,
    phone_number  VARCHAR(30),
    password      VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL,
    status        VARCHAR(50)  NOT NULL,
    is_deleted    TINYINT(1)   NOT NULL DEFAULT 0,
    created_at    DATETIME     NOT NULL,
    updated_at    DATETIME,

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT uk_users_user_code UNIQUE (user_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'idx_users_role');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_users_role ON users(role)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'idx_users_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_users_status ON users(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Academic
CREATE TABLE IF NOT EXISTS academic_years (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    name         VARCHAR(120)  NOT NULL,
    code         VARCHAR(40)   NOT NULL,
    description  TEXT,
    start_date   DATE          NOT NULL,
    end_date     DATE          NOT NULL,
    current_year TINYINT(1)    NOT NULL DEFAULT 0,
    status       VARCHAR(30)   NOT NULL,
    created_at   DATETIME      NOT NULL,
    updated_at   DATETIME,
    created_by   VARCHAR(150),
    updated_by   VARCHAR(150),
    archived     TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_academic_years PRIMARY KEY (id),
    CONSTRAINT uk_academic_years_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'academic_years' AND index_name = 'idx_academic_years_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_academic_years_status ON academic_years(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'academic_years' AND index_name = 'idx_academic_years_start_end');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_academic_years_start_end ON academic_years(start_date, end_date)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS programs (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    name              VARCHAR(150)  NOT NULL,
    code              VARCHAR(40)   NOT NULL,
    description       TEXT,
    department_name   VARCHAR(150),
    faculty_name      VARCHAR(150),
    level             VARCHAR(80)   NOT NULL,
    duration_in_months INT          NOT NULL,
    credits_required  INT           NOT NULL,
    status            VARCHAR(30)   NOT NULL,
    created_at        DATETIME      NOT NULL,
    updated_at        DATETIME,
    created_by        VARCHAR(150),
    updated_by        VARCHAR(150),
    archived          TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_programs PRIMARY KEY (id),
    CONSTRAINT uk_programs_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'programs' AND index_name = 'idx_programs_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_programs_status ON programs(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'programs' AND index_name = 'idx_programs_level');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_programs_level ON programs(level)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS cohorts (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    name             VARCHAR(150)  NOT NULL,
    code             VARCHAR(40)   NOT NULL,
    description      TEXT,
    max_capacity     INT,
    status           VARCHAR(30)   NOT NULL,
    academic_year_id BIGINT        NOT NULL,
    program_id       BIGINT        NOT NULL,
    created_at       DATETIME      NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_cohorts PRIMARY KEY (id),
    CONSTRAINT uk_cohorts_code UNIQUE (code),
    CONSTRAINT fk_cohort_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    CONSTRAINT fk_cohort_program       FOREIGN KEY (program_id)       REFERENCES programs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

CREATE INDEX idx_cohorts_status ON cohorts(status);

-- Classes (JPA entity: ClassRoom -> table 'classes')
CREATE TABLE IF NOT EXISTS classes (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    name             VARCHAR(150)  NOT NULL,
    code             VARCHAR(40)   NOT NULL,
    description      TEXT,
    capacity         INT,
    delivery_mode    VARCHAR(50)   NOT NULL,
    room_label       VARCHAR(100),
    status           VARCHAR(30)   NOT NULL,
    academic_year_id BIGINT        NOT NULL,
    program_id       BIGINT        NOT NULL,
    cohort_id        BIGINT,
    created_at       DATETIME      NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_classes PRIMARY KEY (id),
    CONSTRAINT uk_classes_code UNIQUE (code),
    CONSTRAINT fk_class_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    CONSTRAINT fk_class_program       FOREIGN KEY (program_id)       REFERENCES programs(id),
    CONSTRAINT fk_class_cohort        FOREIGN KEY (cohort_id)        REFERENCES cohorts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

CREATE INDEX idx_classes_status ON classes(status);

-- Courses
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

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

-- Students / Teachers (FK targets)
CREATE TABLE IF NOT EXISTS students (
    id                 BIGINT       NOT NULL AUTO_INCREMENT,
    student_number     VARCHAR(50)  NOT NULL,
    admission_number   VARCHAR(50),
    registration_number VARCHAR(50),
    first_name         VARCHAR(120) NOT NULL,
    last_name          VARCHAR(120) NOT NULL,
    middle_name        VARCHAR(120),
    email              VARCHAR(180),
    phone_number       VARCHAR(40),
    secondary_phone_number VARCHAR(40),
    gender             VARCHAR(30),
    nationality        VARCHAR(80),
    city_of_birth      VARCHAR(120),
    country_of_birth   VARCHAR(120),
    date_of_birth      DATE,
    national_id_number VARCHAR(100),
    passport_number    VARCHAR(100),
    address_line       VARCHAR(255),
    city               VARCHAR(120),
    country            VARCHAR(120),
    postal_code        VARCHAR(30),
    photo_url          TEXT,
    medical_notes      TEXT,
    special_needs_notes TEXT,
    admission_date     DATE,
    registration_date  DATE,
    expected_graduation_date DATE,
    scholarship_holder TINYINT(1)  NOT NULL DEFAULT 0,
    international_student TINYINT(1) NOT NULL DEFAULT 0,
    working_student    TINYINT(1)  NOT NULL DEFAULT 0,
    status             VARCHAR(30) NOT NULL,
    enrollment_type    VARCHAR(30) NOT NULL,
    user_id            BIGINT,
    academic_year_id   BIGINT      NOT NULL,
    program_id         BIGINT      NOT NULL,
    cohort_id          BIGINT,
    class_id           BIGINT,
    created_at         DATETIME    NOT NULL,
    updated_at         DATETIME,
    created_by         VARCHAR(150),
    updated_by         VARCHAR(150),
    archived           TINYINT(1)  NOT NULL DEFAULT 0,

    CONSTRAINT pk_students PRIMARY KEY (id),
    CONSTRAINT uk_students_student_number UNIQUE (student_number),
    CONSTRAINT uk_students_user_id UNIQUE (user_id),
    CONSTRAINT fk_student_user          FOREIGN KEY (user_id)          REFERENCES users(id),
    CONSTRAINT fk_student_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    CONSTRAINT fk_student_program       FOREIGN KEY (program_id)       REFERENCES programs(id),
    CONSTRAINT fk_student_cohort        FOREIGN KEY (cohort_id)        REFERENCES cohorts(id),
    CONSTRAINT fk_student_class         FOREIGN KEY (class_id)         REFERENCES classes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

CREATE INDEX idx_students_status  ON students(status);
CREATE INDEX idx_students_program ON students(program_id);
CREATE INDEX idx_students_class   ON students(class_id);
CREATE INDEX idx_students_cohort  ON students(cohort_id);
CREATE INDEX idx_students_year    ON students(academic_year_id);

CREATE TABLE IF NOT EXISTS teachers (
    id                 BIGINT       NOT NULL AUTO_INCREMENT,
    teacher_number     VARCHAR(50)  NOT NULL,
    employee_number    VARCHAR(50),
    first_name         VARCHAR(120) NOT NULL,
    last_name          VARCHAR(120) NOT NULL,
    middle_name        VARCHAR(120),
    email              VARCHAR(180),
    phone_number       VARCHAR(40),
    secondary_phone_number VARCHAR(40),
    gender             VARCHAR(30),
    nationality        VARCHAR(80),
    date_of_birth      DATE,
    national_id_number VARCHAR(100),
    passport_number    VARCHAR(100),
    address_line       VARCHAR(255),
    city               VARCHAR(120),
    country            VARCHAR(120),
    postal_code        VARCHAR(30),
    photo_url          TEXT,
    bio                TEXT,
    special_notes      TEXT,
    hire_date          DATE,
    end_contract_date  DATE,
    office_location    VARCHAR(180),
    office_hours       TEXT,
    highest_degree     VARCHAR(180),
    years_of_experience INT,
    teaching_hours_quota INT,
    remote_available   TINYINT(1)  NOT NULL DEFAULT 0,
    status             VARCHAR(30) NOT NULL,
    employment_type    VARCHAR(30) NOT NULL,
    user_id            BIGINT,
    academic_year_id   BIGINT      NOT NULL,
    program_id         BIGINT      NOT NULL,
    class_id           BIGINT,
    created_at         DATETIME    NOT NULL,
    updated_at         DATETIME,
    created_by         VARCHAR(150),
    updated_by         VARCHAR(150),
    archived           TINYINT(1)  NOT NULL DEFAULT 0,

    CONSTRAINT pk_teachers PRIMARY KEY (id),
    CONSTRAINT uk_teachers_teacher_number UNIQUE (teacher_number),
    CONSTRAINT uk_teachers_user_id UNIQUE (user_id),
    CONSTRAINT fk_teacher_user          FOREIGN KEY (user_id)          REFERENCES users(id),
    CONSTRAINT fk_teacher_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    CONSTRAINT fk_teacher_program       FOREIGN KEY (program_id)       REFERENCES programs(id),
    CONSTRAINT fk_teacher_class         FOREIGN KEY (class_id)         REFERENCES classes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

CREATE INDEX idx_teachers_status  ON teachers(status);
CREATE INDEX idx_teachers_program ON teachers(program_id);
CREATE INDEX idx_teachers_class   ON teachers(class_id);
CREATE INDEX idx_teachers_year    ON teachers(academic_year_id);

-- Course content
CREATE TABLE IF NOT EXISTS course_modules (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    title            VARCHAR(180) NOT NULL,
    description      TEXT,
    objectives       TEXT,
    display_order    INT          NOT NULL,
    estimated_minutes INT,
    course_id        BIGINT       NOT NULL,
    created_at       DATETIME     NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_course_modules PRIMARY KEY (id),
    CONSTRAINT fk_course_module_course FOREIGN KEY (course_id) REFERENCES courses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

CREATE INDEX idx_course_modules_course ON course_modules(course_id);
CREATE INDEX idx_course_modules_order  ON course_modules(display_order);

CREATE TABLE IF NOT EXISTS lessons (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    title            VARCHAR(180) NOT NULL,
    summary          TEXT,
    content          LONGTEXT,
    display_order    INT          NOT NULL,
    estimated_minutes INT,
    course_module_id BIGINT       NOT NULL,
    created_at       DATETIME     NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_lessons PRIMARY KEY (id),
    CONSTRAINT fk_lesson_course_module FOREIGN KEY (course_module_id) REFERENCES course_modules(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

CREATE INDEX idx_lessons_module ON lessons(course_module_id);
CREATE INDEX idx_lessons_order  ON lessons(display_order);

CREATE TABLE IF NOT EXISTS course_sessions (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    title       VARCHAR(180) NOT NULL,
    description TEXT,
    start_at    DATETIME     NOT NULL,
    end_at      DATETIME     NOT NULL,
    timezone    VARCHAR(80)  NOT NULL,
    meeting_link VARCHAR(500),
    recording_link VARCHAR(500),
    location_label VARCHAR(200),
    mode        VARCHAR(30)  NOT NULL,
    status      VARCHAR(30)  NOT NULL,
    course_id   BIGINT       NOT NULL,
    lesson_id   BIGINT,
    created_at  DATETIME     NOT NULL,
    updated_at  DATETIME,
    created_by  VARCHAR(150),
    updated_by  VARCHAR(150),
    archived    TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_course_sessions PRIMARY KEY (id),
    CONSTRAINT fk_course_session_course FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT fk_course_session_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

CREATE INDEX idx_course_sessions_course ON course_sessions(course_id);
CREATE INDEX idx_course_sessions_lesson ON course_sessions(lesson_id);
CREATE INDEX idx_course_sessions_start_end ON course_sessions(start_at, end_at);
