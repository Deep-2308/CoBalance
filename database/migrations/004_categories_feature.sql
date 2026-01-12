-- Migration: Expense Categories v1
-- Add category column to transactions and expenses tables

-- 1. Add category column to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS category VARCHAR(30) DEFAULT 'other';

-- 2. Add category column to expenses table
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS category VARCHAR(30) DEFAULT 'other';

-- Index for efficient category-based queries
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
