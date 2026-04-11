-- ============================================================
-- V1_0_19__add_is_read_to_notifications.sql
-- Module : Communication & Notifications
-- Auteur : MyDBS Backend
-- Description : Add is_read column to sync with JPA entity
-- ============================================================

ALTER TABLE notifications ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0 AFTER status;
UPDATE notifications SET is_read = 1 WHERE status = 'READ';
UPDATE notifications SET is_read = 0 WHERE status = 'UNREAD';
