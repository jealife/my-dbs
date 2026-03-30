-- ============================================================
-- V1_0_15__create_course_resources.sql
-- Module : Courses & Resources
-- Auteur : MyDBS Backend
-- Date   : 2026-03-24
-- ============================================================

CREATE TABLE IF NOT EXISTS course_resources (
    id                 BIGINT          NOT NULL AUTO_INCREMENT,
    title              VARCHAR(180)    NOT NULL,
    description        TEXT,
    resource_type      VARCHAR(30)     NOT NULL,
    media_category     VARCHAR(30)     NOT NULL,
    visibility         VARCHAR(30)     NOT NULL DEFAULT 'COURSE_ONLY',
    external_url       TEXT,
    stored_file_name   VARCHAR(255),
    original_file_name VARCHAR(255),
    file_extension     VARCHAR(30),
    content_type       VARCHAR(150),
    file_size          BIGINT,
    storage_path       TEXT,
    public_url         TEXT,
    download_count     BIGINT          NOT NULL DEFAULT 0,
    expires_at         VARCHAR(50),
    course_id          BIGINT          NOT NULL,
    course_module_id   BIGINT,
    lesson_id          BIGINT,
    -- Audit fields (BaseAuditEntity)
    created_at         DATETIME        NOT NULL,
    updated_at         DATETIME,
    created_by         VARCHAR(150),
    updated_by         VARCHAR(150),
    archived           TINYINT(1)      NOT NULL DEFAULT 0,

    CONSTRAINT pk_course_resources PRIMARY KEY (id),
    CONSTRAINT fk_course_resource_course
        FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT fk_course_resource_module
        FOREIGN KEY (course_module_id) REFERENCES course_modules(id),
    CONSTRAINT fk_course_resource_lesson
        FOREIGN KEY (lesson_id) REFERENCES lessons(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Index
CREATE INDEX idx_course_resources_course ON course_resources(course_id);
CREATE INDEX idx_course_resources_module ON course_resources(course_module_id);
CREATE INDEX idx_course_resources_lesson ON course_resources(lesson_id);
CREATE INDEX idx_course_resources_category ON course_resources(media_category);
