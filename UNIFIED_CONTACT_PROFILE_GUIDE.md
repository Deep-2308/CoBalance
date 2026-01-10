# Unified Contact Profile - Implementation Guide

## Overview

The **Unified Contact Profile** is a powerful feature that combines:

- **Ledger transactions** (business/personal)
- **Group expenses** (shared splits)

Into a single view showing the total net balance between you and a contact.

## Architecture

### Backend Flow

```
User Request
    ↓
GET /api/contacts/:contactId/profile
    ↓
[Step 1] Verify contact ownership
    ↓
[Step 2] Calculate ledger balance
    ↓
[Step 3] Find contact's user account (by phone)
    ↓
[Step 4] Find shared groups
    ↓
[Step 5] Calculate group balances
    ↓
[Step 6] Combine into total net balance
    ↓
Return unified JSON
```

### Key Innovation: Phone Number Linking

**Problem:** A contact in your ledger might not have a CoBalance account yet.

**Solution:** Link by mobile number!

```javascript
// Find contact's user account
const { data: contactUser } = await supabase
  .from("users")
  .select("id")
  .eq("mobile", contact.mobile) // ← Match by phone
  .single();

// If found, we can calculate group balances
// If not found, only show ledger balance
```

## API Endpoints

### 1. Get Contact Profile

```
GET /api/contacts/:contactId/profile
```

**Response:**

```json
{
  "success": true,
  "contact": {
    "id": "contact-123",
    "name": "Ramesh Shop",
    "type": "customer",
    "mobile": "+919876543210",
    "has_user_account": true,
    "user_id": "user-456"
  },
  "balance": {
    "total_net_balance": "3200.00",
    "ledger_balance": "2500.00",
    "group_balance": "700.00"
  },
  "shared_groups": [
    {
      "id": "group-001",
      "name": "Office Lunch",
      "balance": "500.00",
      "created_at": "2024-01-05T10:00:00.000Z"
    }
  ],
  "recent_activity": [
    {
      "type": "ledger",
      "description": "January supplies",
      "amount": "2500.00",
      "transaction_type": "credit",
      "date": "2024-01-10"
    },
    {
      "type": "group",
      "group_id": "group-001",
      "group_name": "Office Lunch",
      "description": "Team Lunch",
      "amount": "900.00",
      "paid_by_you": true,
      "your_split": "300.00",
      "contact_split": "300.00",
      "date": "2024-01-10"
    }
  ],
  "summary": {
    "total_transactions": 6,
    "shared_groups_count": 2,
    "you_get": "3200.00",
    "you_owe": "0.00"
  }
}
```

### 2. Settle Contact Balance

```
POST /api/contacts/:contactId/settle
```

**Request Body:**

```json
{
  "amount": "3200.00",
  "note": "Full settlement - Jan 2024"
}
```

**What it does:**

1. Creates a transaction in ledger
2. Creates settlement records in all shared groups
3. Marks settlements as paid
4. Returns updated balance

## Frontend Component

### Usage

Navigate to contact profile:

```
/contacts/:contactId/profile
```

### Features

#### 1. Big Balance Card

```jsx
// Green if contact owes you
// Red if you owe contact
// Gray if settled
<div className={isPositive ? "bg-green-50" : "bg-red-50"}>
  ₹{Math.abs(balance).toFixed(2)}
</div>
```

#### 2. Tabs

- **Ledger History** - Direct transactions
- **Group Splits** - Shared group expenses

#### 3. Settle Up

Pre-filled with total balance amount. Creates offsetting transaction.

## Edge Cases Handled

### 1. Contact Without User Account

```javascript
// Contact exists in ledger but hasn't registered
has_user_account: false;
user_id: null;

// Result: Only show ledger balance, no groups
```

### 2. Shared Groups

```javascript
// Find intersection of user's groups and contact's groups
const sharedGroups = userGroupIds.filter((id) => contactGroupIds.includes(id));

// Only calculate balances for shared groups
```

### 3. Complex Group Expenses

```javascript
// Expense: ₹900 paid by you
// Split: You (₹300), Contact (₹300), Other (₹300)

// Contact owes you: ₹300
// Your balance increases by: +₹300
```

## Testing Scenarios

### Scenario 1: Ledger Only Contact

**Setup:**

- Contact: "Local Vendor"
- Mobile: +919999999999
- This number NOT registered on CoBalance
- Ledger balance: ₹5000 (they owe you)

**Expected Result:**

```json
{
  "total_net_balance": "5000.00",
  "ledger_balance": "5000.00",
  "group_balance": "0.00",
  "shared_groups": []
}
```

### Scenario 2: Contact With Groups

**Setup:**

- Contact: "Priya Kumar"
- Mobile: +919123456789
- User account exists
- Shared groups: "Office Lunch", "Roommates"
- Ledger: ₹2000 (you owe)
- Groups: ₹3000 (they owe you)

**Expected Result:**

```json
{
  "total_net_balance": "1000.00",  // 3000 - 2000
  "ledger_balance": "-2000.00",
  "group_balance": "3000.00",
  "shared_groups": [...]
}
```

### Scenario 3: Settled Up

**Setup:**

- All ledger transactions = ₹0
- All group expenses = ₹0

**Expected Result:**

```json
{
  "total_net_balance": "0.00",
  "ledger_balance": "0.00",
  "group_balance": "0.00"
}
```

UI shows: "✓ All Settled Up"

## Integration Steps

### 1. Update Server Routes

Add to `backend/src/server.js`:

```javascript
import contactProfileRoutes from "./routes/contact-profile.routes.js";

app.use("/api/contacts", contactProfileRoutes);
```

### 2. Add Frontend Route

Add to `frontend/src/App.jsx`:

```javascript
import ContactProfilePage from "./pages/ContactProfilePage";

<Route
  path="/contacts/:id/profile"
  element={
    <ProtectedRoute>
      <ContactProfilePage />
    </ProtectedRoute>
  }
/>;
```

### 3. Link From Contact List

Update `ContactDetailPage.jsx` or `LedgerPage.jsx`:

```javascript
// Add "View Profile" button
<Link to={`/contacts/${contactId}/profile`}>
  <button className="btn btn-primary">View Unified Profile</button>
</Link>
```

## Performance Considerations

### Database Queries

The profile makes multiple queries:

1. Contact details (1 query)
2. Ledger transactions (1 query)
3. User lookup by phone (1 query)
4. Shared groups (2 queries)
5. Expenses per group (N queries)

**Optimization Ideas:**

- Cache user lookups by phone
- Batch expense queries
- Use PostgreSQL views for balance calculations
- Add database indexes on mobile number

### Recommended Indexes

```sql
-- Already exist
CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);

-- Add for phone linking
CREATE INDEX idx_users_mobile ON users(mobile);

-- Add for expense queries
CREATE INDEX idx_expenses_group_date ON expenses(group_id, date DESC);
```

## Future Enhancements

### 1. Payment Integration

```javascript
// Add UPI/PayTM settlement
<button onClick={handleUPIPayment}>Pay via UPI</button>
```

### 2. Settlement History

```javascript
// Show past settlements
GET /api/contacts/:id/settlement-history
```

### 3. Split Reminders

```javascript
// Send WhatsApp reminder
POST / api / reminders / send;
```

### 4. Export Transactions

```javascript
// Download PDF/Excel
GET /api/contacts/:id/export
```

## Troubleshooting

### Problem: Contact not found

**Check:**

- Contact ID is correct
- Contact belongs to current user
- User is authenticated

### Problem: Group balance is wrong

**Debug:**

```javascript
// Check shared groups
console.log("Shared groups:", sharedGroups);

// Check expense calculations
expenses.forEach((exp) => {
  console.log("Expense:", exp.description);
  console.log("Your split:", userSplit);
  console.log("Contact split:", contactSplit);
});
```

### Problem: Phone linking not working

**Check:**

```sql
-- Verify phone numbers match exactly
SELECT mobile FROM users WHERE mobile = '+919876543210';
SELECT mobile FROM contacts WHERE id = 'contact-123';

-- Ensure phone format is consistent (+91...)
```

---

**You now have a powerful unified contact profile!** 🚀

This feature is the secret sauce that makes CoBalance better than Khatabook (ledger only) or Splitwise (groups only).
