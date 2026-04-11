-- ============================================================
-- V1_0_21__insert_default_programs.sql
-- Insert default programs matching frontend options
-- ============================================================

-- Insert default programs if they don't exist
INSERT IGNORE INTO programs (id, name, code, description, level, duration_in_months, credits_required, status, created_at) VALUES
(1, 'Communication Digitale', 'COM-DIG', 'Stratégie digitale, réseaux sociaux, e-marketing et community management.', 'Licence', 36, 180, 'ACTIVE', NOW()),
(2, 'Création & Design', 'CRE-DES', 'Graphisme, design numérique, maquettage et expérience utilisateur.', 'Licence', 36, 180, 'ACTIVE', NOW()),
(3, 'Développement Web', 'DEV-WEB', 'Front-end, back-end, frameworks modernes et gestion de projets web.', 'Licence', 36, 180, 'ACTIVE', NOW()),
(4, 'Cyber Sécurité', 'CYB-SEC', 'Sécurité des systèmes, cyberdéfense, audit et conformité informatique.', 'Licence', 36, 180, 'ACTIVE', NOW()),
(5, 'Transformation Digitale', 'TRANS-DIG', 'Pilotage de projets de transformation, innovation et stratégie numérique.', 'Master', 24, 120, 'ACTIVE', NOW()),
(6, 'Direction Artistique', 'DIR-ART', 'Direction créative, branding et direction de projets artistiques digitaux.', 'Master', 24, 120, 'ACTIVE', NOW()),
(7, 'Développement Fullstack', 'DEV-FULL', 'Architecture web avancée, DevOps, APIs et applications cloud-native.', 'Master', 24, 120, 'ACTIVE', NOW());