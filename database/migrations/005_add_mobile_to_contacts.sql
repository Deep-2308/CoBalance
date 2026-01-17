-- Migration: Add mobile column to contacts table
-- This column was in the schema but never applied to the database

-- Add mobile column to contacts table
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);

-- Optional: Add an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_contacts_mobile ON contacts(mobile);
