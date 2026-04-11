-- ============================================================
-- V1_0_11__create_analytics_tables.sql
-- Module : Analytics & IA
-- Auteur : MyDBS Backend
-- Date   : 2026-03-24
-- ============================================================

-- Snapshots analytiques (KPIs périodiques)
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id                          BIGINT        NOT NULL AUTO_INCREMENT,
    scope                       VARCHAR(20)   NOT NULL,
    student_id                  BIGINT,
    cohort_id                   BIGINT,
    program_id                  BIGINT,
    academic_year_id            BIGINT,
    assignment_completion_rate  DECIMAL(5,2),
    attendance_rate             DECIMAL(5,2),
    average_grade               DECIMAL(5,2),
    ects_earned                 INT,
    late_submissions_count      INT,
    unjustified_absences_count  INT,
    dropout_risk_score          DECIMAL(5,2),
    cohort_rank                 INT,
    created_at                  DATETIME      NOT NULL,
    updated_at                  DATETIME,
    created_by                  VARCHAR(150),
    updated_by                  VARCHAR(150),
    archived                    TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_analytics_snapshots PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'analytics_snapshots' AND index_name = 'idx_snapshot_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_snapshot_student ON analytics_snapshots(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'analytics_snapshots' AND index_name = 'idx_snapshot_cohort');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_snapshot_cohort ON analytics_snapshots(cohort_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'analytics_snapshots' AND index_name = 'idx_snapshot_year');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_snapshot_year ON analytics_snapshots(academic_year_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'analytics_snapshots' AND index_name = 'idx_snapshot_scope');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_snapshot_scope ON analytics_snapshots(scope)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'analytics_snapshots' AND index_name = 'idx_snapshot_risk');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_snapshot_risk ON analytics_snapshots(dropout_risk_score)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Alertes de risque (décrochage, absentéisme, etc.)
CREATE TABLE IF NOT EXISTS risk_alerts (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    student_id       BIGINT        NOT NULL,
    academic_year_id BIGINT,
    alert_type       VARCHAR(40)   NOT NULL,
    status           VARCHAR(20)   NOT NULL DEFAULT 'OPEN',
    threshold_value  DOUBLE        NOT NULL,
    observed_value   DOUBLE        NOT NULL,
    message          VARCHAR(500),
    assigned_to_id   BIGINT,
    resolved_at      DATETIME,
    created_at       DATETIME      NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_risk_alerts PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'risk_alerts' AND index_name = 'idx_alert_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_alert_student ON risk_alerts(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'risk_alerts' AND index_name = 'idx_alert_type');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_alert_type ON risk_alerts(alert_type)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'risk_alerts' AND index_name = 'idx_alert_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_alert_status ON risk_alerts(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'risk_alerts' AND index_name = 'idx_alert_year');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_alert_year ON risk_alerts(academic_year_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
