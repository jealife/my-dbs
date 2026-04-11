-- ============================================================
-- V1_0_8__create_notifications_tables.sql
-- Module : Communication & Notifications
-- Auteur : MyDBS Backend
-- Date   : 2026-03-24
-- ============================================================

-- Notifications in-app
CREATE TABLE IF NOT EXISTS notifications (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    user_id          BIGINT       NOT NULL,
    notification_type VARCHAR(20) NOT NULL DEFAULT 'INFO',
    status           VARCHAR(20)  NOT NULL DEFAULT 'UNREAD',
    title            VARCHAR(200) NOT NULL,
    message          VARCHAR(1000) NOT NULL,
    reference_type   VARCHAR(50),
    reference_id     BIGINT,
    action_url       VARCHAR(500),
    read_at          DATETIME,
    created_at       DATETIME     NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_notifications PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'notifications' AND index_name = 'idx_notif_user');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_notif_user ON notifications(user_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'notifications' AND index_name = 'idx_notif_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_notif_status ON notifications(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'notifications' AND index_name = 'idx_notif_type');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_notif_type ON notifications(notification_type)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'notifications' AND index_name = 'idx_notif_created');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_notif_created ON notifications(created_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Annonces (tableau d'affichage numérique)
CREATE TABLE IF NOT EXISTS announcements (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    title            VARCHAR(300) NOT NULL,
    content          TEXT         NOT NULL,
    audience         VARCHAR(30)  NOT NULL DEFAULT 'ALL',
    cohort_id        BIGINT,
    academic_year_id BIGINT,
    published_at     DATETIME,
    expires_at       DATETIME,
    pinned           TINYINT(1)   NOT NULL DEFAULT 0,
    author_id        BIGINT,
    created_at       DATETIME     NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_announcements PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'announcements' AND index_name = 'idx_announcement_published');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_announcement_published ON announcements(published_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'announcements' AND index_name = 'idx_announcement_audience');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_announcement_audience ON announcements(audience)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'announcements' AND index_name = 'idx_announcement_academic_year');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_announcement_academic_year ON announcements(academic_year_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'announcements' AND index_name = 'idx_announcement_pinned');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_announcement_pinned ON announcements(pinned)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Messagerie interne
CREATE TABLE IF NOT EXISTS messages (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    sender_id         BIGINT       NOT NULL,
    recipient_id      BIGINT       NOT NULL,
    thread_id         VARCHAR(36),
    subject           VARCHAR(300),
    body              TEXT         NOT NULL,
    is_read           TINYINT(1)   NOT NULL DEFAULT 0,
    read_at           DATETIME,
    parent_message_id BIGINT,
    created_at        DATETIME     NOT NULL,
    updated_at        DATETIME,
    created_by        VARCHAR(150),
    updated_by        VARCHAR(150),
    archived          TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_messages PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'messages' AND index_name = 'idx_msg_sender');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_msg_sender ON messages(sender_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'messages' AND index_name = 'idx_msg_recipient');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_msg_recipient ON messages(recipient_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'messages' AND index_name = 'idx_msg_thread');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_msg_thread ON messages(thread_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'messages' AND index_name = 'idx_msg_read');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_msg_read ON messages(is_read)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
