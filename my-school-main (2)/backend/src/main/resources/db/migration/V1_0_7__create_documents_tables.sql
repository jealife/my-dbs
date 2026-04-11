-- ============================================================
-- V1_0_7__create_documents_tables.sql
-- Module : GED / Gestion Électronique des Documents
-- Auteur : MyDBS Backend
-- Date   : 2026-03-24
-- ============================================================

-- Documents gérés
CREATE TABLE IF NOT EXISTS managed_documents (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    owner_id         BIGINT,
    document_type    VARCHAR(30)  NOT NULL,
    access_level     VARCHAR(20)  NOT NULL DEFAULT 'MANAGER',
    title            VARCHAR(300) NOT NULL,
    description      VARCHAR(1000),
    reference_type   VARCHAR(50),
    reference_id     BIGINT,
    tags             VARCHAR(500),
    expiry_date      DATE,
    academic_year_id BIGINT,
    current_version_id BIGINT,
    created_at       DATETIME     NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_managed_documents PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'managed_documents' AND index_name = 'idx_doc_owner');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_doc_owner ON managed_documents(owner_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'managed_documents' AND index_name = 'idx_doc_type');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_doc_type ON managed_documents(document_type)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'managed_documents' AND index_name = 'idx_doc_access');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_doc_access ON managed_documents(access_level)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'managed_documents' AND index_name = 'idx_doc_ref_type');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_doc_ref_type ON managed_documents(reference_type)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'managed_documents' AND index_name = 'idx_doc_ref_id');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_doc_ref_id ON managed_documents(reference_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'managed_documents' AND index_name = 'idx_doc_archived');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_doc_archived ON managed_documents(archived)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Versions des documents
CREATE TABLE IF NOT EXISTS document_versions (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    document_id     BIGINT        NOT NULL,
    version_number  INT           NOT NULL,
    file_name       VARCHAR(300)  NOT NULL,
    file_path       VARCHAR(1000) NOT NULL,
    file_size       BIGINT,
    mime_type       VARCHAR(100),
    checksum        VARCHAR(100),
    is_current      TINYINT(1)   NOT NULL DEFAULT 1,
    change_summary  VARCHAR(500),
    created_at      DATETIME     NOT NULL,
    updated_at      DATETIME,
    created_by      VARCHAR(150),
    updated_by      VARCHAR(150),
    archived        TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_document_versions PRIMARY KEY (id),
    CONSTRAINT fk_docver_document FOREIGN KEY (document_id) REFERENCES managed_documents(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'document_versions' AND index_name = 'idx_docver_document');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_docver_document ON document_versions(document_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'document_versions' AND index_name = 'idx_docver_current');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_docver_current ON document_versions(is_current)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Journal des accès (audit trail)
CREATE TABLE IF NOT EXISTS document_access_logs (
    id            BIGINT      NOT NULL AUTO_INCREMENT,
    document_id   BIGINT      NOT NULL,
    user_id       BIGINT      NOT NULL,
    action        VARCHAR(30) NOT NULL,
    accessed_at   DATETIME    NOT NULL,
    ip_address    VARCHAR(50),
    version_id    BIGINT,
    created_at    DATETIME    NOT NULL,
    updated_at    DATETIME,
    created_by    VARCHAR(150),
    updated_by    VARCHAR(150),
    archived      TINYINT(1)  NOT NULL DEFAULT 0,

    CONSTRAINT pk_document_access_logs PRIMARY KEY (id),
    CONSTRAINT fk_accesslog_doc FOREIGN KEY (document_id) REFERENCES managed_documents(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'document_access_logs' AND index_name = 'idx_accesslog_doc');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_accesslog_doc ON document_access_logs(document_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'document_access_logs' AND index_name = 'idx_accesslog_user');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_accesslog_user ON document_access_logs(user_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'document_access_logs' AND index_name = 'idx_accesslog_date');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_accesslog_date ON document_access_logs(accessed_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
