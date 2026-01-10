# Row Level Security (RLS) Implementation Guide

## Overview

Row Level Security (RLS) provides **defense-in-depth** protection at the database level. Even if your backend is compromised, RLS ensures users can only access their own data.

## How RLS Works

### The Magic Function: `auth.uid()`

Supabase provides `auth.uid()` which extracts the user ID from the JWT token:

```sql
-- This returns the current authenticated user's ID
auth.uid()

-- Example: If JWT contains { userId: "user-001" }
-- Then auth.uid() = "user-001"
```

### Policy Structure

Every RLS policy has two parts:

1. **USING** - Determines which rows are visible/modifiable
2. **WITH CHECK** - Validates data being inserted/updated

```sql
CREATE POLICY "policy_name"
ON table_name
FOR SELECT          -- Can be SELECT, INSERT, UPDATE, DELETE, or ALL
USING (condition)   -- Which rows the user can see/modify
WITH CHECK (condition);  -- Validation for INSERT/UPDATE
```

## Detailed Policy Explanations

### 1. Users Table - "Users can view own profile"

```sql
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id);
```

**How it works:**

- User with JWT containing `userId: "user-001"` tries to `SELECT * FROM users`
- RLS automatically adds: `WHERE id = 'user-001'`
- User only sees their own row

**Example:**

```sql
-- User "user-001" executes:
SELECT * FROM users;

-- RLS transforms it to:
SELECT * FROM users WHERE id = 'user-001';
-- Only returns user-001's profile
```

### 2. Groups Table - "Users can view groups they belong to"

```sql
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
```

**How it works:**

1. User tries to `SELECT * FROM groups`
2. For each group row, RLS checks:
   - Is there a matching row in `group_members`?
   - Where `group_id` = this group's ID
   - AND `user_id` = current user's ID?
3. If EXISTS returns true → row is visible
4. If false → row is hidden

**Example:**

```sql
-- User "user-001" executes:
SELECT * FROM groups;

-- RLS transforms it to:
SELECT * FROM groups
WHERE EXISTS (
  SELECT 1 FROM group_members
  WHERE group_members.group_id = groups.id
  AND group_members.user_id = 'user-001'
);

-- Only returns groups where user-001 is a member
```

**Visual Breakdown:**

```
groups table:
┌─────────┬──────────────┐
│ id      │ name         │
├─────────┼──────────────┤
│ group-1 │ Office Lunch │  ← User IS member ✅
│ group-2 │ Goa Trip     │  ← User NOT member ❌
│ group-3 │ Roommates    │  ← User IS member ✅
└─────────┴──────────────┘

group_members table:
┌─────────┬──────────┐
│ group_id│ user_id  │
├─────────┼──────────┤
│ group-1 │ user-001 │  ← Match!
│ group-2 │ user-002 │
│ group-3 │ user-001 │  ← Match!
└─────────┴──────────┘

Result: User sees only group-1 and group-3
```

### 3. Expenses Table - "Users can view expenses in their groups"

```sql
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
```

**How it works:**

1. User tries to view expenses
2. For each expense, RLS checks:
   - Does this expense belong to a group?
   - Is the user a member of that group?
3. Only shows expenses from user's groups

**Example:**

```
expenses table:
┌──────┬─────────┬─────────────┐
│ id   │ group_id│ description │
├──────┼─────────┼─────────────┤
│ exp-1│ group-1 │ Lunch       │  ← User in group-1 ✅
│ exp-2│ group-2 │ Hotel       │  ← User NOT in group-2 ❌
│ exp-3│ group-1 │ Coffee      │  ← User in group-1 ✅
└──────┴─────────┴─────────────┘

Result: User sees exp-1 and exp-3 only
```

### 4. Transactions Table - "Users can view own transactions"

```sql
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
```

**How it works:**

1. Transactions belong to contacts
2. Contacts belong to users
3. RLS follows the chain:
   - transaction → contact → user
4. Only shows transactions for user's contacts

**Example:**

```
contacts table (user-001's contacts):
┌──────────┬─────────┬──────────┐
│ id       │ user_id │ name     │
├──────────┼─────────┼──────────┤
│ contact-1│ user-001│ Ramesh   │
│ contact-2│ user-001│ Suresh   │
└──────────┴─────────┴──────────┘

transactions table:
┌──────┬────────────┬────────┐
│ id   │ contact_id │ amount │
├──────┼────────────┼────────┤
│ txn-1│ contact-1  │ 500.00 │  ← user-001's contact ✅
│ txn-2│ contact-3  │ 300.00 │  ← NOT user-001's contact ❌
│ txn-3│ contact-2  │ 800.00 │  ← user-001's contact ✅
└──────┴────────────┴────────┘

Result: User sees txn-1 and txn-3
```

## Policy Types

### SELECT Policies (Read)

```sql
FOR SELECT USING (condition)
```

Controls which rows user can READ

### INSERT Policies (Create)

```sql
FOR INSERT WITH CHECK (condition)
```

Validates data being CREATED

### UPDATE Policies (Modify)

```sql
FOR UPDATE
USING (condition)        -- Which rows can be updated
WITH CHECK (condition)   -- Validation for new values
```

### DELETE Policies (Remove)

```sql
FOR DELETE USING (condition)
```

Controls which rows can be DELETED

## Testing RLS

### 1. In Supabase SQL Editor

```sql
-- Enable RLS for testing
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claim.sub TO 'user-001';

-- Now test queries
SELECT * FROM groups;
-- Should only show user-001's groups

-- Reset
RESET ALL;
```

### 2. Via API with Real JWT

```javascript
// Frontend code - RLS automatically applied
const { data, error } = await supabase.from("groups").select("*");

// User only gets their groups!
```

### 3. Service Role Bypass

```javascript
// Backend with service_role key
const supabase = createClient(url, SERVICE_ROLE_KEY);

// RLS is BYPASSED - admin access
const { data } = await supabase.from("groups").select("*");
// Returns ALL groups
```

## Performance Optimization

RLS adds JOINs to every query. Ensure indexes exist:

```sql
-- Already in schema.sql
CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
```

## Security Best Practices

### ✅ DO:

1. Always enable RLS on user data tables
2. Test policies with different user credentials
3. Use service_role ONLY in backend, never frontend
4. Combine RLS with application-level validation

### ❌ DON'T:

1. Expose service_role key in frontend
2. Disable RLS on production tables
3. Rely on RLS alone (defense-in-depth!)
4. Skip testing edge cases

## Common Patterns

### Pattern 1: Own Data Access

```sql
-- User owns the row directly
USING (user_id = auth.uid())
```

### Pattern 2: Indirect Access via Join

```sql
-- User belongs to a group that contains the data
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = target_table.group_id
    AND group_members.user_id = auth.uid()
  )
)
```

### Pattern 3: Creator/Owner Rights

```sql
-- User created the resource
USING (created_by = auth.uid())
```

### Pattern 4: Multi-Party Access

```sql
-- User is either from_user or to_user
USING (from_user = auth.uid() OR to_user = auth.uid())
```

## Troubleshooting

### Problem: Users can't see any data

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check policies exist
SELECT * FROM pg_policies;
```

### Problem: Policy too permissive

```sql
-- Add more restrictive conditions
-- Before:
USING (true)  -- BAD: Everyone sees everything

-- After:
USING (user_id = auth.uid())  -- GOOD: Only own data
```

### Problem: Performance issues

```sql
-- Check query plan
EXPLAIN ANALYZE SELECT * FROM expenses;

-- Add missing indexes if needed
```

## Migration Strategy

1. **Test in Development**

   ```bash
   # Run RLS policies
   psql -U postgres -d cobalance_dev -f rls_policies.sql
   ```

2. **Verify with Different Users**

   ```javascript
   // Login as different users and test
   ```

3. **Monitor Performance**

   ```sql
   -- Check slow queries
   SELECT * FROM pg_stat_statements;
   ```

4. **Deploy to Production**
   ```bash
   # Run on production database
   psql -U postgres -d cobalance_prod -f rls_policies.sql
   ```

---

**Remember**: RLS is a safety net, not a replacement for proper authentication and authorization in your application code!
