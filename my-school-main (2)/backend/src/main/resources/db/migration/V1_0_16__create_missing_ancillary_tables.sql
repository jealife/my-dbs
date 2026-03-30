-- ============================================================
-- V1_0_16__create_missing_ancillary_tables.sql
-- Missing tables detected during JPA validation
-- ============================================================

-- Course Versions
CREATE TABLE IF NOT EXISTS course_versions (
    id                 BIGINT          NOT NULL AUTO_INCREMENT,
    version_number     INT             NOT NULL,
    version_label      VARCHAR(120)    NOT NULL,
    published_snapshot TINYINT(1)      NOT NULL DEFAULT 0,
    snapshot_json      LONGTEXT        NOT NULL,
    course_id          BIGINT          NOT NULL,
    created_at         DATETIME        NOT NULL,
    updated_at         DATETIME,
    created_by         VARCHAR(150),
    updated_by         VARCHAR(150),
    archived           TINYINT(1)      NOT NULL DEFAULT 0,
    CONSTRAINT pk_course_versions PRIMARY KEY (id),
    CONSTRAINT fk_course_version_course FOREIGN KEY (course_id) REFERENCES courses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
CREATE INDEX idx_course_versions_course ON course_versions(course_id);
CREATE INDEX idx_course_versions_number ON course_versions(version_number);

-- Teacher Specializations
CREATE TABLE IF NOT EXISTS teacher_specializations (
    id                     BIGINT          NOT NULL AUTO_INCREMENT,
    label                  VARCHAR(180)    NOT NULL,
    description            TEXT,
    primary_specialization TINYINT(1)      NOT NULL DEFAULT 0,
    teacher_id             BIGINT          NOT NULL,
    created_at             DATETIME        NOT NULL,
    updated_at             DATETIME,
    created_by             VARCHAR(150),
    updated_by             VARCHAR(150),
    archived               TINYINT(1)      NOT NULL DEFAULT 0,
    CONSTRAINT pk_teacher_specializations PRIMARY KEY (id),
    CONSTRAINT fk_teacher_specialization_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
CREATE INDEX idx_teacher_specialization_teacher ON teacher_specializations(teacher_id);

-- Teacher Qualifications
CREATE TABLE IF NOT EXISTS teacher_qualifications (
    id               BIGINT          NOT NULL AUTO_INCREMENT,
    title            VARCHAR(180)    NOT NULL,
    institution_name VARCHAR(180)    NOT NULL,
    country          VARCHAR(120),
    year_awarded     INT,
    description      TEXT,
    teacher_id       BIGINT          NOT NULL,
    created_at       DATETIME        NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)      NOT NULL DEFAULT 0,
    CONSTRAINT pk_teacher_qualifications PRIMARY KEY (id),
    CONSTRAINT fk_teacher_qualification_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
CREATE INDEX idx_teacher_qualification_teacher ON teacher_qualifications(teacher_id);

-- Teacher Status History
CREATE TABLE IF NOT EXISTS teacher_status_history (
    id            BIGINT          NOT NULL AUTO_INCREMENT,
    old_status    VARCHAR(30),
    new_status    VARCHAR(30)     NOT NULL,
    reason        TEXT,
    context_label VARCHAR(255),
    teacher_id    BIGINT          NOT NULL,
    created_at    DATETIME        NOT NULL,
    updated_at    DATETIME,
    created_by    VARCHAR(150),
    updated_by    VARCHAR(150),
    archived      TINYINT(1)      NOT NULL DEFAULT 0,
    CONSTRAINT pk_teacher_status_history PRIMARY KEY (id),
    CONSTRAINT fk_teacher_status_history_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
CREATE INDEX idx_teacher_status_history_teacher ON teacher_status_history(teacher_id);

-- Student Status History
CREATE TABLE IF NOT EXISTS student_status_history (
    id            BIGINT          NOT NULL AUTO_INCREMENT,
    old_status    VARCHAR(30),
    new_status    VARCHAR(30)     NOT NULL,
    reason        TEXT,
    context_label VARCHAR(255),
    student_id    BIGINT          NOT NULL,
    created_at    DATETIME        NOT NULL,
    updated_at    DATETIME,
    created_by    VARCHAR(150),
    updated_by    VARCHAR(150),
    archived      TINYINT(1)      NOT NULL DEFAULT 0,
    CONSTRAINT pk_student_status_history PRIMARY KEY (id),
    CONSTRAINT fk_student_status_history_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
CREATE INDEX idx_student_status_history_student ON student_status_history(student_id);

-- Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id                     BIGINT          NOT NULL AUTO_INCREMENT,
    full_name              VARCHAR(180)    NOT NULL,
    relationship_label     VARCHAR(80)     NOT NULL,
    phone_number           VARCHAR(40)     NOT NULL,
    secondary_phone_number VARCHAR(40),
    email                  VARCHAR(180),
    address_line           VARCHAR(255),
    priority_order         INT             NOT NULL DEFAULT 1,
    student_id             BIGINT          NOT NULL,
    created_at             DATETIME        NOT NULL,
    updated_at             DATETIME,
    created_by             VARCHAR(150),
    updated_by             VARCHAR(150),
    archived               TINYINT(1)      NOT NULL DEFAULT 0,
    CONSTRAINT pk_emergency_contacts PRIMARY KEY (id),
    CONSTRAINT fk_emergency_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
CREATE INDEX idx_emergency_student ON emergency_contacts(student_id);

-- Guardian Contacts
CREATE TABLE IF NOT EXISTS guardian_contacts (
    id                     BIGINT          NOT NULL AUTO_INCREMENT,
    full_name              VARCHAR(180)    NOT NULL,
    relationship_label     VARCHAR(80)     NOT NULL,
    phone_number           VARCHAR(40)     NOT NULL,
    secondary_phone_number VARCHAR(40),
    email                  VARCHAR(180),
    address_line           VARCHAR(255),
    city                   VARCHAR(120),
    country                VARCHAR(120),
    primary_contact        TINYINT(1)      NOT NULL DEFAULT 0,
    student_id             BIGINT          NOT NULL,
    created_at             DATETIME        NOT NULL,
    updated_at             DATETIME,
    created_by             VARCHAR(150),
    updated_by             VARCHAR(150),
    archived               TINYINT(1)      NOT NULL DEFAULT 0,
    CONSTRAINT pk_guardian_contacts PRIMARY KEY (id),
    CONSTRAINT fk_guardian_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
CREATE INDEX idx_guardian_student ON guardian_contacts(student_id);
