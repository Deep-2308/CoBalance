# Shadow/Ghost User Accounts - Implementation Guide

## Overview

Shadow Accounts (also called Ghost Users) allow you to add friends to groups **before they sign up** for CoBalance. This dramatically improves UX - just like Splitwise and Khatabook.

## How It Works

### User Flow

**Before:**

1. User tries to add friend (9876543210)
2. ❌ Error: "User not registered"
3. User has to wait for friend to download app
4. Bad UX!

**After (with Shadow Accounts):**

1. User adds friend (9876543210)
2. ✅ System auto-creates "Friend 3210"
3. Friend appears in group immediately
4. User can add expenses and split bills
5. When friend signs up later, their account "claims" the ghost user

## Technical Implementation

### Backend Logic

```javascript
// POST /api/groups/:id/members
// Body: { mobile: "9876543210" }

if (userExists) {
  // Add existing user to group
} else {
  // CREATE GHOST USER
  const newUser = await supabase.from("users").insert({
    mobile: "+919876543210",
    name: "Friend 3210", // Last 4 digits
    language: "en",
    // NO password/auth - it's a ghost!
  });

  // Add ghost user to group
  await supabase.from("group_members").insert({
    group_id: groupId,
    user_id: newUser.id,
  });
}
```

### Ghost User Properties

```javascript
{
  id: "uuid-generated",
  mobile: "+919876543210",
  name: "Friend 3210",     // Auto-generated
  language: "en",
  created_at: "2024-01-10...",
  // NO auth_id - they haven't logged in
  // NO password - they're a ghost
}
```

## Identifying Ghost Users

**Ghost users are identified by:**

1. ✅ They have a mobile number
2. ✅ They have a generic name ("Friend XXXX")
3. ❌ They have NO authentication data
4. ❌ They have NEVER logged in

**Real users:**

- Have logged in at least once
- Have set their actual name
- May have updated their profile

## When Ghost User Signs Up

**Automatic Account Claiming:**

```javascript
// When user signs up with +919876543210:

1. Backend checks: Does user with this mobile exist?
2. IF YES (ghost exists):
   - Link auth credentials to existing user
   - Update name if user provides one
   - Keep all existing group memberships!
   - Keep all expenses/transactions
3. IF NO:
   - Create new user normally
```

**Before Signup:**

```
User: "Friend 3210"
Groups: [Office Lunch, Goa Trip]
Expenses: 5 expenses (added by others)
Balance: Owes ₹500
```

**After Signup:**

```
User: "Ravi Kumar" (updated name)
Groups: [Office Lunch, Goa Trip] ✅ KEPT
Expenses: 5 expenses ✅ KEPT
Balance: Owes ₹500 ✅ KEPT
Auth: Now has password ✅ NEW
```

## Benefits

### 1. Faster Onboarding

- Add anyone instantly
- No "waiting for friend to sign up"
- Start splitting immediately

### 2. Better UX

- Like Splitwise/Khatabook
- Reduces friction
- More viral (friends see their name in app)

### 3. Data Continuity

- When ghost signs up, they see their history
- All expenses are already there
- Balances are preserved

## Edge Cases

### Case 1: Multiple Ghosts for Same Number

**Prevention:**

```javascript
// Check for existing user by mobile before creating
const existing = await supabase
  .from("users")
  .select("*")
  .eq("mobile", mobile)
  .single();

if (existing) {
  // Use existing (whether ghost or real)
} else {
  // Create new ghost
}
```

### Case 2: Ghost User Added to Multiple Groups

**Handled Automatically:**

```
Friend 3210 added to:
- Group A (by User X)
- Group B (by User Y)
- Group C (by User Z)

When they sign up:
- They see ALL 3 groups
- All balances intact
```

### Case 3: Expenses Paid By Ghost Users

**Works Fine:**

```javascript
// Ghost can be "payer" in expense
{
  description: "Taxi",
  amount: 500,
  paid_by: "ghost-user-id",  // ✅ Valid
  split_between: [...]
}

// When ghost signs up, they see:
// "You paid ₹500 for Taxi"
```

### Case 4: Naming Conflicts

**Current Solution:**

```
Friend 3210  // Last 4 digits
Friend 5678  // Different number
Friend 3210  // Same last 4?
```

**Potential Improvement:**

```javascript
// Add random suffix if collision
const ghostName = `Friend ${last4Digits}`;
const existing = await findUserByName(ghostName);
if (existing) {
  ghostName = `Friend ${last4Digits}-${randomSuffix}`;
}
```

## Frontend Experience

### Adding Ghost User

```javascript
// User adds mobile: 9876543210
const response = await api.post(`/groups/${groupId}/members`, {
  mobile: "9876543210"
});

// Response:
{
  success: true,
  member: {
    id: "...",
    name: "Friend 3210",
    mobile: "+919876543210"
  },
  is_ghost_user: true,
  message: "User not registered yet. Created temporary account and added!"
}
```

### Showing Ghost Users

```jsx
// In member list
{
  members.map((member) => (
    <div>
      <p>{member.name}</p>
      {member.name.startsWith("Friend") && (
        <span className="text-xs text-gray-500">(Not registered yet)</span>
      )}
    </div>
  ));
}
```

## API Response

### Success (New Ghost User)

```json
{
  "success": true,
  "member": {
    "id": "uuid-123",
    "name": "Friend 3210",
    "mobile": "+919876543210"
  },
  "is_ghost_user": true,
  "message": "User not registered yet. Created temporary account and added to group!"
}
```

### Success (Existing User)

```json
{
  "success": true,
  "member": {
    "id": "uuid-456",
    "name": "Ravi Kumar",
    "mobile": "+919876543210"
  },
  "is_ghost_user": false,
  "message": "Member added successfully"
}
```

## Database Changes

**No schema changes needed!**

The existing `users` table works perfectly:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    mobile VARCHAR(15) UNIQUE,  -- ✅ Used for ghosts
    name VARCHAR(100),          -- ✅ "Friend XXXX"
    language VARCHAR(10),       -- ✅ Default 'en'
    created_at TIMESTAMP,
    updated_at TIMESTAMP
    -- NO is_ghost column needed!
);
```

**Ghost users are just users without auth credentials.**

## Claiming Process (Future Enhancement)

```javascript
// In auth.controller.js - verifyOTP function

export const verifyOTP = async (req, res) => {
  const { mobile, otp } = req.body;

  // Check if ghost user exists
  const existingUser = await supabase
    .from("users")
    .select("*")
    .eq("mobile", mobile)
    .single();

  if (existingUser) {
    // CLAIM: Link auth to existing user
    // Update name if they provide one
    // Keep all groups/expenses
    return res.json({
      token: generateJWT(existingUser.id),
      user: existingUser,
      isNewUser: false, // They have data!
      claimedAccount: true,
    });
  } else {
    // New user - create normally
  }
};
```

## Security Considerations

### ✅ Safe

- Ghosts can't log in (no auth)
- Ghosts can't see other users' data (RLS still applies)
- Ghosts are passive (no API access until claimed)

### ⚠️ Consider

- Rate limit ghost creation (prevent spam)
- Validate mobile numbers
- Maybe require CAPTCHA for ghost creation

## Best Practices

1. **Always check for existing user first**
2. **Use consistent naming** (Friend XXXX)
3. **Log ghost creation** for monitoring
4. **Show UI indicator** for ghost users
5. **Encourage sign-up** (notifications when ghost owes money)

## Future Improvements

### 1. Ghost User Invitations

```javascript
// Send SMS to ghost users
"You've been added to 'Goa Trip' group on CoBalance!
Download now: https://cobalance.app
Your temporary account: Friend 3210"
```

### 2. Ghost Analytics

```javascript
// Track conversion rate
- Ghosts created: 100
- Ghosts who signed up: 45
- Conversion rate: 45%
```

### 3. Auto-merge on signup

```javascript
// When user signs up, auto-detect ghost account
// Merge automatically without manual intervention
```

---

**This feature makes CoBalance much more user-friendly!** 🚀

Users can now create groups and add expenses immediately, even if their friends haven't downloaded the app yet.
