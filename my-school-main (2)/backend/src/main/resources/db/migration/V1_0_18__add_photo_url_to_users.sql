-- Add photo_url to users table
ALTER TABLE users ADD COLUMN photo_url TEXT;

-- If needed, add other profile-related fields to users for general use
ALTER TABLE users ADD COLUMN bio TEXT;
