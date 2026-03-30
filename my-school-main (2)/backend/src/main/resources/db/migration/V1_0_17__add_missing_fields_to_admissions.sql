-- ============================================================
-- V1_0_2__add_missing_fields_to_admissions.sql
-- Module : Admissions
-- Auteur : MyDBS Backend
-- Date   : 2026-03-26
-- ============================================================

ALTER TABLE admission_applications 
ADD COLUMN middle_name          VARCHAR(120) AFTER last_name,
ADD COLUMN secondary_phone_number VARCHAR(40) AFTER phone_number,
ADD COLUMN city_of_birth        VARCHAR(120) AFTER gender,
ADD COLUMN country_of_birth     VARCHAR(120) AFTER city_of_birth,
ADD COLUMN national_id_number   VARCHAR(100) AFTER date_of_birth,
ADD COLUMN passport_number      VARCHAR(100) AFTER national_id_number,
ADD COLUMN city                 VARCHAR(120) AFTER address_line,
ADD COLUMN country              VARCHAR(120) AFTER city,
ADD COLUMN postal_code          VARCHAR(30)  AFTER country;
