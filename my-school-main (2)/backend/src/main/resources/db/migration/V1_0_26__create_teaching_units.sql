-- ─────────────────────────────────────────────────────────────────────────────
-- V1_0_26 : Système LMD — Unités d'Enseignement (UE) + semestre par cours
-- ─────────────────────────────────────────────────────────────────────────────

-- Table des Unités d'Enseignement (UE)
-- Chaque filière (program) est divisée en UE par semestre.
-- Chaque UE regroupe plusieurs cours.
CREATE TABLE IF NOT EXISTS teaching_units (
    id             BIGINT       AUTO_INCREMENT PRIMARY KEY,
    code           VARCHAR(40)  NOT NULL,
    name           VARCHAR(200) NOT NULL,
    description    VARCHAR(1000),
    semester       VARCHAR(10)  NOT NULL,   -- ex: S1, S2, S3, S4, S5, S6
    order_index    INT          NOT NULL DEFAULT 1,
    program_id     BIGINT       NOT NULL,
    created_at     DATETIME(6)  DEFAULT CURRENT_TIMESTAMP(6),
    updated_at     DATETIME(6)  DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    archived       BIT(1)       NOT NULL DEFAULT 0,
    CONSTRAINT fk_tu_program FOREIGN KEY (program_id) REFERENCES programs(id),
    INDEX idx_tu_program    (program_id),
    INDEX idx_tu_semester   (semester),
    INDEX idx_tu_archived   (archived)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ajout du semestre et de l'UE sur les cours
ALTER TABLE courses
    ADD COLUMN IF NOT EXISTS semester         VARCHAR(10)  NULL COMMENT 'Semestre du cours : S1-S6',
    ADD COLUMN IF NOT EXISTS teaching_unit_id BIGINT       NULL COMMENT 'UE parente du cours';

ALTER TABLE courses
    ADD CONSTRAINT fk_course_teaching_unit
        FOREIGN KEY (teaching_unit_id) REFERENCES teaching_units(id);

CREATE INDEX IF NOT EXISTS idx_courses_semester ON courses(semester);
CREATE INDEX IF NOT EXISTS idx_courses_tu       ON courses(teaching_unit_id);
