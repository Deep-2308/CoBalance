-- Migration: Payment Reminders v1
-- Add mobile column to contacts and create reminders table

-- 1. Add mobile column to contacts table (optional field for WhatsApp reminders)
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);

-- 2. Create reminders table to store reminder history
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- For ledger contacts
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    -- For group member reminders  
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    -- Recipient details (stored for history even if contact/user is deleted)
    recipient_name VARCHAR(100) NOT NULL,
    recipient_mobile VARCHAR(20),
    -- Reminder details
    amount DECIMAL(12, 2) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_contact ON reminders(contact_id);
CREATE INDEX IF NOT EXISTS idx_reminders_group_target ON reminders(group_id, target_user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_sent_at ON reminders(sent_at DESC);

-- Trigger for RLS (if needed later)
-- Reminders are owned by the user who sent them
