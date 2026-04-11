-- V1_0_27 : Suppression du coefficient — le système LMD utilise les crédits ECTS
-- pour pondérer les cours entre eux ; le coefficient n'est plus pertinent.

ALTER TABLE courses         DROP COLUMN IF EXISTS coefficient;
ALTER TABLE evaluations     DROP COLUMN IF EXISTS coefficient;
ALTER TABLE assignments     DROP COLUMN IF EXISTS coefficient;
ALTER TABLE grade_items     DROP COLUMN IF EXISTS coefficient;
ALTER TABLE grade_books     DROP COLUMN IF EXISTS coefficient;
