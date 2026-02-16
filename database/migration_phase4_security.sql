-- Phase 4: Auth Security Hardening Migration
-- Run this against your Supabase database

-- Password reset support
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP WITH TIME ZONE;

-- Account lockout support
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- Index for faster token lookup during password reset
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(password_reset_token) WHERE password_reset_token IS NOT NULL;
