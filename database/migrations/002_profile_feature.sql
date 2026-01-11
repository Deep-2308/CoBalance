-- Profile Feature Migration
-- Run this after the main schema is created

-- Add business info and preferences columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_category VARCHAR(50); -- shop, freelancer, service
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_phone VARCHAR(15);
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_reminder_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_reminder_message TEXT DEFAULT 'Hi, this is a friendly reminder about your pending balance. Please settle when convenient.';

-- Create index for business users
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
