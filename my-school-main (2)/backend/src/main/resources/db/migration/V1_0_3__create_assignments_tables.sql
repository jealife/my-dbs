-- ============================================================
-- V1_0_3__create_assignments_tables.sql
-- Module : Devoirs & Quiz
-- Auteur : MyDBS Backend
-- Date   : 2026-03-24
-- ============================================================

-- Table des devoirs
CREATE TABLE IF NOT EXISTS assignments (
    id                    BIGINT        NOT NULL AUTO_INCREMENT,
    title                 VARCHAR(200)  NOT NULL,
    description           TEXT,
    instructions          TEXT,
    assignment_type       VARCHAR(30)   NOT NULL,
    max_score             DOUBLE        NOT NULL DEFAULT 20.0,
    passing_score         DOUBLE,
    coefficient           DOUBLE        NOT NULL DEFAULT 1.0,
    due_date              DATETIME      NOT NULL,
    available_from        DATETIME,
    allow_late_submission TINYINT(1)    NOT NULL DEFAULT 0,
    late_penalty_percent  DOUBLE,
    max_attempts          INT           NOT NULL DEFAULT 1,
    published             TINYINT(1)    NOT NULL DEFAULT 0,
    results_published     TINYINT(1)    NOT NULL DEFAULT 0,
    semester              VARCHAR(20),
    course_id             BIGINT        NOT NULL,
    academic_year_id      BIGINT        NOT NULL,
    cohort_id             BIGINT,
    created_by_user_id    BIGINT,
    -- Audit
    created_at            DATETIME      NOT NULL,
    updated_at            DATETIME,
    created_by            VARCHAR(150),
    updated_by            VARCHAR(150),
    archived              TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_assignments PRIMARY KEY (id),
    CONSTRAINT fk_assignment_course       FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT fk_assignment_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    CONSTRAINT fk_assignment_cohort       FOREIGN KEY (cohort_id) REFERENCES cohorts(id),
    CONSTRAINT fk_assignment_creator      FOREIGN KEY (created_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'assignments' AND index_name = 'idx_assignment_course');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_assignment_course ON assignments(course_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'assignments' AND index_name = 'idx_assignment_cohort');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_assignment_cohort ON assignments(cohort_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'assignments' AND index_name = 'idx_assignment_year');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_assignment_year ON assignments(academic_year_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'assignments' AND index_name = 'idx_assignment_type');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_assignment_type ON assignments(assignment_type)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'assignments' AND index_name = 'idx_assignment_due');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_assignment_due ON assignments(due_date)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'assignments' AND index_name = 'idx_assignment_archived');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_assignment_archived ON assignments(archived)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Table des soumissions
CREATE TABLE IF NOT EXISTS submissions (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    assignment_id    BIGINT        NOT NULL,
    student_id       BIGINT        NOT NULL,
    status           VARCHAR(20)   NOT NULL DEFAULT 'NOT_SUBMITTED',
    content          TEXT,
    file_path        TEXT,
    file_name        VARCHAR(255),
    file_size_bytes  BIGINT,
    version_number   INT           NOT NULL DEFAULT 1,
    is_latest        TINYINT(1)    NOT NULL DEFAULT 1,
    submitted_at     DATETIME,
    is_late          TINYINT(1)    NOT NULL DEFAULT 0,
    score            DOUBLE,
    final_score      DOUBLE,
    teacher_feedback TEXT,
    graded_at        DATETIME,
    returned_at      DATETIME,
    -- Audit
    created_at       DATETIME      NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_submissions PRIMARY KEY (id),
    CONSTRAINT fk_submission_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id),
    CONSTRAINT fk_submission_student    FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'submissions' AND index_name = 'idx_submission_assignment');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_submission_assignment ON submissions(assignment_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'submissions' AND index_name = 'idx_submission_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_submission_student ON submissions(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'submissions' AND index_name = 'idx_submission_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_submission_status ON submissions(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'submissions' AND index_name = 'idx_submission_latest');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_submission_latest ON submissions(is_latest)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Table des quiz
CREATE TABLE IF NOT EXISTS quizzes (
    id                   BIGINT       NOT NULL AUTO_INCREMENT,
    assignment_id        BIGINT       NOT NULL,
    time_limit_minutes   INT,
    randomize_questions  TINYINT(1)   NOT NULL DEFAULT 0,
    randomize_choices    TINYINT(1)   NOT NULL DEFAULT 0,
    show_correct_answers TINYINT(1)   NOT NULL DEFAULT 0,
    show_after_submission TINYINT(1)  NOT NULL DEFAULT 1,
    passing_percentage   DOUBLE       NOT NULL DEFAULT 50.0,
    available_from       DATETIME,
    available_until      DATETIME,
    -- Audit
    created_at           DATETIME     NOT NULL,
    updated_at           DATETIME,
    created_by           VARCHAR(150),
    updated_by           VARCHAR(150),
    archived             TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_quizzes PRIMARY KEY (id),
    CONSTRAINT uk_quiz_assignment UNIQUE (assignment_id),
    CONSTRAINT fk_quiz_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'quizzes' AND index_name = 'idx_quiz_assignment');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_quiz_assignment ON quizzes(assignment_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Table des questions
CREATE TABLE IF NOT EXISTS questions (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    quiz_id         BIGINT       NOT NULL,
    question_type   VARCHAR(20)  NOT NULL,
    text            TEXT NOT NULL,
    explanation     TEXT,
    points          DOUBLE       NOT NULL DEFAULT 1.0,
    order_index     INT          NOT NULL DEFAULT 0,
    expected_answer VARCHAR(500),
    -- Audit
    created_at      DATETIME     NOT NULL,
    updated_at      DATETIME,
    created_by      VARCHAR(150),
    updated_by      VARCHAR(150),
    archived        TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_questions PRIMARY KEY (id),
    CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'questions' AND index_name = 'idx_question_quiz');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_question_quiz ON questions(quiz_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'questions' AND index_name = 'idx_question_order');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_question_order ON questions(order_index)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Table des choix de réponse
CREATE TABLE IF NOT EXISTS choices (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    question_id BIGINT        NOT NULL,
    text        TEXT NOT NULL,
    is_correct  TINYINT(1)    NOT NULL DEFAULT 0,
    order_index INT           NOT NULL DEFAULT 0,
    -- Audit
    created_at  DATETIME      NOT NULL,
    updated_at  DATETIME,
    created_by  VARCHAR(150),
    updated_by  VARCHAR(150),
    archived    TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_choices PRIMARY KEY (id),
    CONSTRAINT fk_choice_question FOREIGN KEY (question_id) REFERENCES questions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'choices' AND index_name = 'idx_choice_question');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_choice_question ON choices(question_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Table des tentatives de quiz
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id                BIGINT    NOT NULL AUTO_INCREMENT,
    quiz_id           BIGINT    NOT NULL,
    student_id        BIGINT    NOT NULL,
    attempt_number    INT       NOT NULL DEFAULT 1,
    started_at        DATETIME  NOT NULL,
    submitted_at      DATETIME,
    score             DOUBLE,
    max_score         DOUBLE,
    score_percentage  DOUBLE,
    passed            TINYINT(1),
    time_taken_minutes INT,
    is_submitted      TINYINT(1) NOT NULL DEFAULT 0,
    -- Audit
    created_at        DATETIME  NOT NULL,
    updated_at        DATETIME,
    created_by        VARCHAR(150),
    updated_by        VARCHAR(150),
    archived          TINYINT(1) NOT NULL DEFAULT 0,

    CONSTRAINT pk_quiz_attempts PRIMARY KEY (id),
    CONSTRAINT fk_attempt_quiz    FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
    CONSTRAINT fk_attempt_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'quiz_attempts' AND index_name = 'idx_attempt_quiz');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_attempt_quiz ON quiz_attempts(quiz_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'quiz_attempts' AND index_name = 'idx_attempt_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_attempt_student ON quiz_attempts(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Table des réponses par tentative (collection embarquée)
CREATE TABLE IF NOT EXISTS quiz_answers (
    attempt_id    BIGINT        NOT NULL,
    question_id   BIGINT        NOT NULL,
    answer_value  TEXT,
    is_correct    TINYINT(1),
    points_earned DOUBLE,

    CONSTRAINT fk_quiz_answer_attempt FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'quiz_answers' AND index_name = 'idx_quiz_answer_attempt');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_quiz_answer_attempt ON quiz_answers(attempt_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
