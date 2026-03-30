-- ============================================================
-- V1_0_6__create_finance_tables.sql
-- Module : Finance & Paiements
-- Auteur : MyDBS Backend
-- Date   : 2026-03-24
-- ============================================================

-- Barèmes des frais de scolarité
CREATE TABLE IF NOT EXISTS tuition_fees (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    program_id       BIGINT       NOT NULL,
    academic_year_id BIGINT       NOT NULL,
    amount           DECIMAL(12,2) NOT NULL,
    currency         VARCHAR(5)   NOT NULL DEFAULT 'XOF',
    label            VARCHAR(200) NOT NULL,
    description      VARCHAR(1000),
    due_installments INT          NOT NULL DEFAULT 1,
    created_at       DATETIME     NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)   NOT NULL DEFAULT 0,

    CONSTRAINT pk_tuition_fees PRIMARY KEY (id),
    CONSTRAINT uk_tuition_program_year UNIQUE (program_id, academic_year_id),
    CONSTRAINT fk_tuition_program FOREIGN KEY (program_id) REFERENCES programs(id),
    CONSTRAINT fk_tuition_year    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'tuition_fees' AND index_name = 'idx_tuition_program');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_tuition_program ON tuition_fees(program_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'tuition_fees' AND index_name = 'idx_tuition_year');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_tuition_year ON tuition_fees(academic_year_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Factures
CREATE TABLE IF NOT EXISTS invoices (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    invoice_number   VARCHAR(50)   NOT NULL UNIQUE,
    student_id       BIGINT        NOT NULL,
    academic_year_id BIGINT        NOT NULL,
    label            VARCHAR(200)  NOT NULL,
    total_amount     DECIMAL(12,2) NOT NULL,
    amount_paid      DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    amount_remaining DECIMAL(12,2),
    currency         VARCHAR(5)    NOT NULL DEFAULT 'XOF',
    status           VARCHAR(20)   NOT NULL DEFAULT 'DRAFT',
    issue_date       DATE,
    due_date         DATE,
    notes            VARCHAR(1000),
    created_at       DATETIME      NOT NULL,
    updated_at       DATETIME,
    created_by       VARCHAR(150),
    updated_by       VARCHAR(150),
    archived         TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_invoices PRIMARY KEY (id),
    CONSTRAINT fk_invoice_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_invoice_year    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'invoices' AND index_name = 'idx_invoice_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_invoice_student ON invoices(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'invoices' AND index_name = 'idx_invoice_year');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_invoice_year ON invoices(academic_year_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'invoices' AND index_name = 'idx_invoice_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_invoice_status ON invoices(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'invoices' AND index_name = 'idx_invoice_number');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_invoice_number ON invoices(invoice_number)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Paiements
CREATE TABLE IF NOT EXISTS payments (
    id                 BIGINT        NOT NULL AUTO_INCREMENT,
    invoice_id         BIGINT        NOT NULL,
    payment_reference  VARCHAR(80)   UNIQUE,
    amount             DECIMAL(12,2) NOT NULL,
    currency           VARCHAR(5)    NOT NULL DEFAULT 'XOF',
    payment_method     VARCHAR(20)   NOT NULL,
    status             VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    payment_date       DATE,
    confirmed_at       DATETIME,
    transaction_id     VARCHAR(150),
    receipt_number     VARCHAR(80),
    notes              VARCHAR(500),
    created_at         DATETIME      NOT NULL,
    updated_at         DATETIME,
    created_by         VARCHAR(150),
    updated_by         VARCHAR(150),
    archived           TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_payments PRIMARY KEY (id),
    CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'payments' AND index_name = 'idx_payment_invoice');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_payment_invoice ON payments(invoice_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'payments' AND index_name = 'idx_payment_method');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_payment_method ON payments(payment_method)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'payments' AND index_name = 'idx_payment_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_payment_status ON payments(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'payments' AND index_name = 'idx_payment_ref');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_payment_ref ON payments(payment_reference)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Échéanciers de paiement
CREATE TABLE IF NOT EXISTS payment_schedules (
    id                  BIGINT        NOT NULL AUTO_INCREMENT,
    invoice_id          BIGINT        NOT NULL,
    installment_number  INT           NOT NULL,
    amount_due          DECIMAL(12,2) NOT NULL,
    amount_paid         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    due_date            DATE          NOT NULL,
    status              VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    created_at          DATETIME      NOT NULL,
    updated_at          DATETIME,
    created_by          VARCHAR(150),
    updated_by          VARCHAR(150),
    archived            TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_payment_schedules PRIMARY KEY (id),
    CONSTRAINT fk_schedule_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'payment_schedules' AND index_name = 'idx_schedule_invoice');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_schedule_invoice ON payment_schedules(invoice_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'payment_schedules' AND index_name = 'idx_schedule_due');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_schedule_due ON payment_schedules(due_date)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'payment_schedules' AND index_name = 'idx_schedule_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_schedule_status ON payment_schedules(status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────────────────────

-- Bourses et réductions
CREATE TABLE IF NOT EXISTS scholarships (
    id                      BIGINT        NOT NULL AUTO_INCREMENT,
    student_id              BIGINT        NOT NULL,
    academic_year_id        BIGINT        NOT NULL,
    label                   VARCHAR(200)  NOT NULL,
    description             VARCHAR(1000),
    amount                  DECIMAL(12,2),
    discount_percentage     DOUBLE,
    currency                VARCHAR(5)    DEFAULT 'XOF',
    start_date              DATE,
    end_date                DATE,
    approved                TINYINT(1)    NOT NULL DEFAULT 0,
    applied_to_invoice_id   BIGINT,
    created_at              DATETIME      NOT NULL,
    updated_at              DATETIME,
    created_by              VARCHAR(150),
    updated_by              VARCHAR(150),
    archived                TINYINT(1)    NOT NULL DEFAULT 0,

    CONSTRAINT pk_scholarships PRIMARY KEY (id),
    CONSTRAINT fk_scholarship_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_scholarship_year    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'scholarships' AND index_name = 'idx_scholarship_student');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_scholarship_student ON scholarships(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'scholarships' AND index_name = 'idx_scholarship_year');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_scholarship_year ON scholarships(academic_year_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
