-- ============================================================
-- V1_0_23__create_student_lesson_progress.sql
-- Track lesson completion progress per student per course
-- ============================================================

CREATE TABLE IF NOT EXISTS student_lesson_progress (
    id            BIGINT    NOT NULL AUTO_INCREMENT,
    user_id       BIGINT    NOT NULL,
    lesson_id     BIGINT    NOT NULL,
    course_id     BIGINT    NOT NULL,
    completed_at  DATETIME  NOT NULL,

    CONSTRAINT pk_student_lesson_progress PRIMARY KEY (id),
    CONSTRAINT uq_student_lesson          UNIQUE (user_id, lesson_id),
    CONSTRAINT fk_slp_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    CONSTRAINT fk_slp_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    CONSTRAINT fk_slp_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_slp_user_course ON student_lesson_progress (user_id, course_id);
