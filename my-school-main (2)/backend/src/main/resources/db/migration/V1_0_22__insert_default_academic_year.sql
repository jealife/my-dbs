-- ============================================================
-- V1_0_22__insert_default_academic_year.sql
-- Insert default academic year if none exists
-- ============================================================

-- Insert default academic year if table is empty
INSERT INTO academic_years (name, code, description, start_date, end_date, current_year, status, created_at)
SELECT 'Année Académique 2025-2026', 'AY-2025-2026', 'Année académique 2025-2026', '2025-09-01', '2026-06-30', 1, 'ACTIVE', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM academic_years WHERE archived = 0);