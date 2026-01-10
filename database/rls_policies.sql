-- ============================================
-- CoBalance Row Level Security (RLS) Policies
-- ============================================
-- 
-- Defense-in-depth security layer for Supabase
-- Even with service_role key, RLS provides database-level protection
--
-- IMPORTANT: Run this AFTER creating the main schema (schema.sql)
-- ============================================

-- ==================== ENABLE RLS ====================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- Note: otp_codes table is excluded (managed by backend only)

-- ==================== USERS TABLE POLICIES ====================

-- Policy 1: Users can SELECT their own profile
-- HOW IT WORKS: user_id from JWT must match the row's id
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can UPDATE their own profile
-- HOW IT WORKS: Only allows updating your own row
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Users can INSERT (register) their own profile
-- HOW IT WORKS: New users can create their profile during signup
CREATE POLICY "Users can create own profile"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- ==================== CONTACTS TABLE POLICIES ====================

-- Policy 4: Users can only view their own contacts
-- HOW IT WORKS: user_id in contacts must match current user's ID
CREATE POLICY "Users can view own contacts"
ON contacts
FOR SELECT
USING (user_id = auth.uid());

-- Policy 5: Users can create contacts for themselves
CREATE POLICY "Users can create own contacts"
ON contacts
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy 6: Users can update their own contacts
CREATE POLICY "Users can update own contacts"
ON contacts
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 7: Users can delete their own contacts
CREATE POLICY "Users can delete own contacts"
ON contacts
FOR DELETE
USING (user_id = auth.uid());

-- ==================== TRANSACTIONS TABLE POLICIES ====================

-- Policy 8: Users can view transactions for their contacts
-- HOW IT WORKS: 
-- 1. Joins transactions → contacts
-- 2. Checks if contact.user_id = current user
CREATE POLICY "Users can view own transactions"
ON transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = transactions.contact_id
    AND contacts.user_id = auth.uid()
  )
);

-- Policy 9: Users can create transactions for their contacts
CREATE POLICY "Users can create own transactions"
ON transactions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = transactions.contact_id
    AND contacts.user_id = auth.uid()
  )
);

-- Policy 10: Users can update their own transactions
CREATE POLICY "Users can update own transactions"
ON transactions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = transactions.contact_id
    AND contacts.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = transactions.contact_id
    AND contacts.user_id = auth.uid()
  )
);

-- Policy 11: Users can delete their own transactions
CREATE POLICY "Users can delete own transactions"
ON transactions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = transactions.contact_id
    AND contacts.user_id = auth.uid()
  )
);

-- ==================== GROUPS TABLE POLICIES ====================

-- Policy 12: Users can view groups they are members of
-- HOW IT WORKS:
-- 1. Joins groups → group_members
-- 2. Checks if current user is in group_members for this group
CREATE POLICY "Users can view groups they belong to"
ON groups
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = groups.id
    AND group_members.user_id = auth.uid()
  )
);

-- Policy 13: Users can create groups (they become members automatically)
CREATE POLICY "Users can create groups"
ON groups
FOR INSERT
WITH CHECK (created_by = auth.uid());

-- Policy 14: Only group creator can update group name
-- HOW IT WORKS: created_by must match current user
CREATE POLICY "Group creator can update group"
ON groups
FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Policy 15: Only group creator can delete group
CREATE POLICY "Group creator can delete group"
ON groups
FOR DELETE
USING (created_by = auth.uid());

-- ==================== GROUP_MEMBERS TABLE POLICIES ====================

-- Policy 16: Users can view members of groups they belong to
-- HOW IT WORKS:
-- 1. For each group_member row
-- 2. Check if current user is also a member of that group
CREATE POLICY "Users can view members of their groups"
ON group_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members AS gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
  )
);

-- Policy 17: Group creator can add members
-- HOW IT WORKS: Only the person who created the group can add members
CREATE POLICY "Group creator can add members"
ON group_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.created_by = auth.uid()
  )
);

-- Policy 18: Group creator can remove members
CREATE POLICY "Group creator can remove members"
ON group_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.created_by = auth.uid()
  )
);

-- Policy 19: Users can remove themselves from a group
CREATE POLICY "Users can leave groups"
ON group_members
FOR DELETE
USING (user_id = auth.uid());

-- ==================== EXPENSES TABLE POLICIES ====================

-- Policy 20: Users can view expenses in groups they belong to
-- HOW IT WORKS:
-- 1. Joins expenses → group_members
-- 2. Checks if current user is a member of the expense's group
CREATE POLICY "Users can view expenses in their groups"
ON expenses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = expenses.group_id
    AND group_members.user_id = auth.uid()
  )
);

-- Policy 21: Group members can create expenses
-- HOW IT WORKS: User must be a member of the group to add expense
CREATE POLICY "Group members can create expenses"
ON expenses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = expenses.group_id
    AND group_members.user_id = auth.uid()
  )
);

-- Policy 22: User who created expense can update it
-- HOW IT WORKS: Only the person who paid can edit the expense
CREATE POLICY "Expense payer can update expense"
ON expenses
FOR UPDATE
USING (paid_by = auth.uid())
WITH CHECK (paid_by = auth.uid());

-- Policy 23: Expense payer or group creator can delete expense
CREATE POLICY "Expense payer can delete expense"
ON expenses
FOR DELETE
USING (
  paid_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = expenses.group_id
    AND groups.created_by = auth.uid()
  )
);

-- ==================== SETTLEMENTS TABLE POLICIES ====================

-- Policy 24: Users can view settlements in their groups
-- HOW IT WORKS: User must be a member of the settlement's group
CREATE POLICY "Users can view settlements in their groups"
ON settlements
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = settlements.group_id
    AND group_members.user_id = auth.uid()
  )
);

-- Policy 25: System/Backend can create settlements
-- (Usually automated, but group members can also create)
CREATE POLICY "Group members can create settlements"
ON settlements
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = settlements.group_id
    AND group_members.user_id = auth.uid()
  )
);

-- Policy 26: Users involved in settlement can update it (mark as paid)
CREATE POLICY "Settlement participants can update status"
ON settlements
FOR UPDATE
USING (
  from_user = auth.uid() OR to_user = auth.uid()
)
WITH CHECK (
  from_user = auth.uid() OR to_user = auth.uid()
);

-- Policy 27: Settlement participants or group creator can delete
CREATE POLICY "Settlement participants can delete"
ON settlements
FOR DELETE
USING (
  from_user = auth.uid()
  OR to_user = auth.uid()
  OR EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = settlements.group_id
    AND groups.created_by = auth.uid()
  )
);

-- ==================== HELPER FUNCTION ====================

-- Function to get current user's ID from JWT
-- This is used by RLS policies: auth.uid()
-- Supabase automatically provides this function

-- ==================== VERIFICATION QUERIES ====================

-- Test these queries after applying RLS:

-- 1. Test user can only see own profile
-- SELECT * FROM users; -- Should only return current user's row

-- 2. Test user can only see own contacts
-- SELECT * FROM contacts; -- Should only return current user's contacts

-- 3. Test user can only see groups they're in
-- SELECT * FROM groups; -- Should only return groups where user is member

-- 4. Test user can only see expenses in their groups
-- SELECT * FROM expenses; -- Should only return expenses from user's groups

-- ==================== NOTES ====================

-- 1. Service Role Key Bypass:
--    - When using service_role key, RLS is BYPASSED
--    - RLS only applies to authenticated user requests
--    - Backend with service_role can still do admin operations

-- 2. Performance Considerations:
--    - RLS adds JOINs to every query
--    - Ensure proper indexes exist (already in schema.sql)
--    - For large datasets, monitor query performance

-- 3. Testing RLS:
--    - Use Supabase SQL Editor with "Enable RLS" toggle
--    - Test with different user JWTs
--    - Verify users can't access others' data

-- 4. Future Enhancements:
--    - Add policies for admin roles
--    - Add audit logging policies
--    - Add time-based access controls

-- ==================== END ====================
