-- V1.0.20 — Champs étendus pour le formulaire de candidature (parents + parcours académique)

ALTER TABLE admission_applications
    ADD COLUMN IF NOT EXISTS department              VARCHAR(120)  NULL,
    ADD COLUMN IF NOT EXISTS father_name             VARCHAR(180)  NULL,
    ADD COLUMN IF NOT EXISTS father_profession       VARCHAR(180)  NULL,
    ADD COLUMN IF NOT EXISTS father_company          VARCHAR(180)  NULL,
    ADD COLUMN IF NOT EXISTS father_address          VARCHAR(255)  NULL,
    ADD COLUMN IF NOT EXISTS father_city             VARCHAR(120)  NULL,
    ADD COLUMN IF NOT EXISTS father_phone            VARCHAR(40)   NULL,
    ADD COLUMN IF NOT EXISTS mother_name             VARCHAR(180)  NULL,
    ADD COLUMN IF NOT EXISTS mother_profession       VARCHAR(180)  NULL,
    ADD COLUMN IF NOT EXISTS mother_company          VARCHAR(180)  NULL,
    ADD COLUMN IF NOT EXISTS mother_address          VARCHAR(255)  NULL,
    ADD COLUMN IF NOT EXISTS mother_city             VARCHAR(120)  NULL,
    ADD COLUMN IF NOT EXISTS mother_phone            VARCHAR(40)   NULL,
    ADD COLUMN IF NOT EXISTS entry_level             VARCHAR(80)   NULL,
    ADD COLUMN IF NOT EXISTS previous_diploma_year   VARCHAR(10)   NULL,
    ADD COLUMN IF NOT EXISTS previous_diploma_title  VARCHAR(255)  NULL,
    ADD COLUMN IF NOT EXISTS previous_school         VARCHAR(255)  NULL,
    ADD COLUMN IF NOT EXISTS previous_school_city    VARCHAR(120)  NULL;
