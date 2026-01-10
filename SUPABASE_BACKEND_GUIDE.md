# Supabase Backend Integration Guide

## Overview

This guide explains the Supabase client configuration for your CoBalance backend.

## Client Types Explained

### 🔑 Admin Client (service_role)

**What it is:**

- Uses `service_role` key
- **Bypasses all Row Level Security (RLS)**
- Has full admin access to database

**When to use:**

- ✅ 99% of backend operations
- ✅ User management (create, update, delete users)
- ✅ Bulk operations
- ✅ Background jobs
- ✅ Data migrations
- ✅ Admin dashboards

**Backend Use Case:**

```javascript
import { getSupabaseAdmin } from "./config/supabase.js";

// Admin client - bypasses RLS
const supabase = getSupabaseAdmin();

// Can access ANY data
const { data } = await supabase.from("users").select("*");
// Returns ALL users (no RLS filtering)
```

### 👤 User Client (JWT-scoped)

**What it is:**

- Uses user's JWT token
- **Respects Row Level Security (RLS)**
- Limited to user's own data

**When to use:**

- ✅ Testing RLS policies in backend
- ✅ Maintaining user context for audit logs
- ✅ Enforcing RLS even in backend (rare)

**Backend Use Case:**

```javascript
import { createUserClient } from "./config/supabase.js";

// User-scoped client - respects RLS
const userToken = req.headers.authorization.split(" ")[1];
const userSupabase = createUserClient(userToken);

// Only sees user's own data (RLS enforced)
const { data } = await userSupabase.from("contacts").select("*");
// Returns only current user's contacts
```

## Which One Should You Use?

### ✅ **Use Admin Client (Default)**

For 99% of your backend operations, use the **Admin Client**:

**Reasons:**

1. **Simpler Code** - No need to manage user tokens
2. **More Flexible** - Can perform admin operations
3. **RLS Optional** - You enforce permissions in application code
4. **Industry Standard** - Most backends use admin/service accounts

**Example:**

```javascript
// Your typical controller
export const getContacts = async (req, res) => {
  const userId = req.user.userId; // From JWT middleware
  const supabase = getSupabaseAdmin();

  // You control access via WHERE clause
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", userId); // ← YOU enforce security

  res.json({ data });
};
```

### ⚠️ **Use User Client (Rare Cases)**

Only use User Client when you specifically want RLS enforcement:

**Use Cases:**

1. Testing RLS policies from backend
2. Building a "preview as user" admin feature
3. Strict security requirements (defense-in-depth)

**Example:**

```javascript
// Testing if user can access a group
export const testGroupAccess = async (req, res) => {
  const userToken = req.headers.authorization.split(" ")[1];
  const userSupabase = createUserClient(userToken);

  // RLS will automatically filter groups
  const { data, error } = await userSupabase
    .from("groups")
    .select("*")
    .eq("id", req.params.groupId);

  // If data is empty, user doesn't have access (RLS blocked it)
  if (!data.length) {
    return res.status(403).json({ error: "Access denied" });
  }

  res.json({ data });
};
```

## Recommendation for CoBalance

**Use Admin Client for everything** and enforce permissions in your middleware/controllers:

```javascript
// ✅ RECOMMENDED APPROACH

// Middleware checks permissions
export const requireGroupMember = async (req, res, next) => {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", req.params.groupId)
    .eq("user_id", req.user.userId)
    .single();

  if (!data) {
    return res.status(403).json({ error: "Not a group member" });
  }

  next();
};

// Use in routes
app.get("/groups/:groupId/expenses", requireGroupMember, getGroupExpenses);
```

**Why this is better:**

- ✅ Clear, explicit permission checks
- ✅ Easier to debug
- ✅ More flexible (can add caching, logging, etc.)
- ✅ Standard pattern in industry

## Safe SQL Queries

### ❌ NEVER DO THIS (SQL Injection Risk)

```javascript
// DANGEROUS - User input directly in query
const { data } = await supabase.rpc("exec_sql", {
  query: `SELECT * FROM users WHERE id = '${userId}'`, // ← SQL INJECTION!
});
```

### ✅ ALWAYS DO THIS (Safe)

**Option 1: Use Supabase Query Builder (Recommended)**

```javascript
// Supabase automatically escapes parameters
const { data } = await supabase.from("users").select("*").eq("id", userId); // ← Safe, auto-escaped
```

**Option 2: Parameterized Raw SQL**

```javascript
// Create PostgreSQL function first (in Supabase SQL Editor)
CREATE OR REPLACE FUNCTION get_user_balance(p_user_id UUID)
RETURNS TABLE (balance DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT SUM(
    CASE
      WHEN t.transaction_type = 'credit' THEN t.amount
      ELSE -t.amount
    END
  ) as balance
  FROM contacts c
  JOIN transactions t ON t.contact_id = c.id
  WHERE c.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

// Call from backend
const { data } = await supabase.rpc('get_user_balance', {
  p_user_id: userId // ← Safe, parameterized
});
```

## Example: getUserBalance Implementation

```javascript
import { getSupabaseAdmin } from "../config/supabase.js";

export const getUserBalance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const supabase = getSupabaseAdmin();

    // Fetch contacts with transactions (safe, auto-escaped)
    const { data: contacts, error } = await supabase
      .from("contacts")
      .select(
        `
        id,
        name,
        transactions (
          amount,
          transaction_type
        )
      `
      )
      .eq("user_id", userId);

    if (error) throw error;

    // Calculate balance in JavaScript
    let totalCredit = 0;
    let totalDebit = 0;

    contacts.forEach((contact) => {
      contact.transactions.forEach((txn) => {
        const amount = parseFloat(txn.amount);
        if (txn.transaction_type === "credit") {
          totalCredit += amount;
        } else {
          totalDebit += amount;
        }
      });
    });

    const netBalance = totalCredit - totalDebit;

    return res.json({
      success: true,
      totalCredit: totalCredit.toFixed(2),
      totalDebit: totalDebit.toFixed(2),
      netBalance: netBalance.toFixed(2),
    });
  } catch (err) {
    console.error("Balance calculation error:", err);
    return res.status(500).json({ error: "Failed to calculate balance" });
  }
};
```

## Testing Your Setup

```bash
# Start backend
cd backend
npm run dev

# Test health check
curl http://localhost:5000/api/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:5000/api/dashboard/balance
```

## Common Patterns

### Pattern 1: Basic CRUD

```javascript
// Create
const { data } = await supabase.from("contacts").insert({ name, user_id });

// Read
const { data } = await supabase
  .from("contacts")
  .select("*")
  .eq("user_id", userId);

// Update
const { data } = await supabase
  .from("contacts")
  .update({ name })
  .eq("id", contactId);

// Delete
const { data } = await supabase.from("contacts").delete().eq("id", contactId);
```

### Pattern 2: Joins & Relations

```javascript
// Fetch groups with members and expenses
const { data } = await supabase
  .from("groups")
  .select(
    `
    id,
    name,
    group_members (
      user_id,
      users (name, mobile)
    ),
    expenses (
      id,
      description,
      amount
    )
  `
  )
  .eq("id", groupId);
```

### Pattern 3: Aggregation

```javascript
// Count transactions per contact
const { data } = await supabase
  .from("contacts")
  .select("id, name, transactions(count)")
  .eq("user_id", userId);
```

## Security Checklist

- ✅ Never expose `service_role` key in frontend
- ✅ Always validate user permissions in backend
- ✅ Use parameterized queries (never string concatenation)
- ✅ Implement authentication middleware
- ✅ Log sensitive operations
- ✅ Rate limit API endpoints
- ✅ Enable RLS as defense-in-depth (optional)

---

**Summary:** Use Admin Client for backend operations. It's simpler, more flexible, and industry standard. Enforce security in your application code.
