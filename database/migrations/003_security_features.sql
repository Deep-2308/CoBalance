-- Profile v2 Security Feature Migration
-- Sessions tracking, email verification, and account deletion

-- Sessions table for tracking active logins
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL, -- SHA256 hash of JWT for identification
    device_type VARCHAR(50) DEFAULT 'unknown', -- mobile, desktop, tablet
    device_name VARCHAR(100), -- Browser/OS info
    ip_address VARCHAR(45), -- IPv4 or IPv6
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_sessions_active ON user_sessions(user_id, last_active_at DESC);

-- Add security fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Index for deletion requests (for admin cleanup jobs)
CREATE INDEX IF NOT EXISTS idx_users_deletion ON users(deletion_requested_at) WHERE deletion_requested_at IS NOT NULL;
