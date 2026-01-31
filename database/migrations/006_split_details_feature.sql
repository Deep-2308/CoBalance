-- Split Details Feature Migration
-- Adds split_details JSONB column to transactions table
-- This column stores the split configuration for split bill transactions
-- 
-- Expected JSON structure:
-- {
--   "type": "equal | amount | percentage",
--   "participants": [
--     { "userId": "uuid", "name": "...", "amount": 250.25, "percentage": 25 }
--   ]
-- }
--
-- Note: This is a backward compatible change. Existing transactions will have
-- split_details as NULL, which is valid and indicates a non-split transaction.

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS split_details JSONB NULL;

-- Add a comment to the column for documentation
COMMENT ON COLUMN transactions.split_details IS 'Optional JSON object storing split bill details: type (equal/amount/percentage) and participant breakdown';
