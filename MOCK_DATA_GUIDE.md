# Mock Data System - CoBalance

## Overview

This system prevents schema drift between your mock data (development) and Supabase (production) by using JSDoc types derived directly from your SQL schema.

## File Structure

```
frontend/src/
├── types/
│   └── database.types.js      # JSDoc types matching Supabase schema
├── data/
│   └── mockData.js            # Type-safe mock data + helpers
└── services/auth/
    └── MockAuthService.js     # Uses mockData.js
```

## Features

### ✅ **Type Safety**

- All mock data is validated against database types
- Autocomplete in VS Code for mock data
- Catch schema mismatches before deployment

### ✅ **Realistic Scenarios**

1. **Ledger**: Multiple contacts with mixed credit/debit transactions
2. **Groups**: 3-person and 4-person expense groups
3. **Expenses**: Equal splits with complex calculations
4. **Settlements**: Pending and paid settlements

### ✅ **Helper Functions**

```javascript
import mockData from "@/data/mockData";

// Get user's contacts
const contacts = mockData.getContactsByUser("user-001-deep-patel");

// Get transactions with calculated balance
const { transactions, balance } =
  mockData.getTransactionsByContact("contact-001");

// Get group members
const members = mockData.getGroupMembers("group-001-office-lunch");

// Calculate balances in a group
const balances = mockData.calculateGroupBalances("group-001-office-lunch");
```

## Mock Data Included

### 👥 Users (5)

- Deep Patel (main user for testing)
- Raj Sharma
- Priya Kumar
- Amit Singh
- Sneha Reddy

### 📖 Ledger

- **4 Contacts**: Customer, Supplier, Friend, Office Supplies
- **6 Transactions**: Mixed credits and debits
- **Calculated Balances**: Automatic balance computation

### 👥 Groups (3)

#### 1. Office Lunch Group (3 members)

- Deep, Raj, Priya
- **Expenses**:
  - ₹900 Chinese Restaurant (equal split)
  - ₹450 Coffee & Snacks (equal split)
- **Settlements**: 2 pending

#### 2. Goa Trip 2024 (4 members)

- Deep, Raj, Priya, Amit
- **Expenses**:
  - ₹12,000 Hotel (equal 4-way split)
  - ₹2,400 Cab (equal 4-way split)
  - ₹3,600 Dinner (equal 4-way split)
- **Settlements**: 1 paid, 1 pending

#### 3. Apartment Roommates (3 members)

- Priya, Amit, Sneha
- **Expenses**:
  - ₹30,000 Rent (equal split)
  - ₹2,100 Electricity (equal split)
  - ₹3,000 Groceries (equal split)
- **Settlements**: 2 pending

## Usage Examples

### Example 1: Display User's Dashboard

```javascript
import { getDashboardSummary } from "@/data/mockData";

function Dashboard() {
  const summary = getDashboardSummary();

  return (
    <div>
      <h2>Net Balance: ₹{summary.netBalance}</h2>
      <p>You'll Get: ₹{summary.totalYouGet}</p>
      <p>You Owe: ₹{summary.totalYouOwe}</p>
    </div>
  );
}
```

### Example 2: List User's Contacts with Balances

```javascript
import { getContactsByUser, getTransactionsByContact } from "@/data/mockData";

function ContactList() {
  const contacts = getContactsByUser("user-001-deep-patel");

  return (
    <ul>
      {contacts.map((contact) => {
        const { balance } = getTransactionsByContact(contact.id);
        return (
          <li key={contact.id}>
            {contact.name}: ₹{balance.toFixed(2)}
            {balance > 0 ? " (you get)" : " (you owe)"}
          </li>
        );
      })}
    </ul>
  );
}
```

### Example 3: Display Group with Member Balances

```javascript
import {
  getGroupMembers,
  getExpensesByGroup,
  calculateGroupBalances,
} from "@/data/mockData";

function GroupDetail({ groupId }) {
  const members = getGroupMembers(groupId);
  const expenses = getExpensesByGroup(groupId);
  const balances = calculateGroupBalances(groupId);

  return (
    <div>
      <h3>Members & Balances</h3>
      {members.map((member) => (
        <div key={member.id}>
          {member.name}: ₹{balances.get(member.id)?.toFixed(2) || "0.00"}
        </div>
      ))}

      <h3>Expenses ({expenses.length})</h3>
      {expenses.map((expense) => (
        <div key={expense.id}>
          {expense.description} - ₹{expense.amount}
        </div>
      ))}
    </div>
  );
}
```

## Integration with MockAuthService

Update your `MockAuthService.js` to return realistic mock users:

```javascript
import { mockUsers } from "@/data/mockData";

class MockAuthService {
  async verifyOTP(mobile, otp) {
    // Find existing user or create new one
    let user = mockUsers.find((u) => u.mobile === mobile);

    if (!user) {
      user = mockUsers[0]; // Default to Deep Patel for testing
    }

    const mockToken = `mock_jwt_token_${Date.now()}`;

    return {
      success: true,
      token: mockToken,
      user: user,
    };
  }
}
```

## Validating Against Schema

Before deploying, test with real backend to ensure compatibility:

```javascript
// 1. Test with mock data (VITE_USE_MOCK_AUTH=true)
// 2. Switch to real backend (VITE_USE_MOCK_AUTH=false)
// 3. Verify all API calls work
// 4. Check that data structure matches
```

## Adding New Mock Data

When adding features:

1. **Update Schema** (`database/schema.sql`)
2. **Update Types** (`types/database.types.js`)
3. **Update Mock Data** (`data/mockData.js`)
4. **Test UI** with mock data
5. **Test API** with real backend

### Example: Adding a new Transaction

```javascript
// 1. Check Transaction type in database.types.js
/**
 * @typedef {Object} Transaction
 * @property {UUID} id
 * @property {UUID} contact_id
 * @property {string} amount - Decimal string
 * @property {'credit'|'debit'} transaction_type
 * ... etc
 */

// 2. Add to mockTransactions array
const newTransaction = {
  id: "txn-999",
  contact_id: "contact-001",
  amount: "1500.00", // ✅ Decimal string (matches schema)
  transaction_type: "credit", // ✅ Valid enum
  note: "New payment",
  date: "2024-01-20", // ✅ DateString format
  created_at: "2024-01-20T10:00:00.000Z", // ✅ ISO string
  updated_at: "2024-01-20T10:00:00.000Z",
};
```

## Type Checking in VS Code

Enable better autocomplete:

```javascript
// Add to the top of your component file
/**
 * @typedef {import('@/types/database.types').User} User
 * @typedef {import('@/types/database.types').Contact} Contact
 */

/** @type {User} */
const user = mockUsers[0]; // ✅ Full autocomplete!

/** @type {Contact} */
const contact = {
  // VS Code will show required fields and types
};
```

## Common Scenarios

### Scenario 1: Testing Equal Split (3 people)

```javascript
const expense = mockExpenses[0]; // Office Lunch - ₹900
// Paid by: Deep
// Split: Deep (₹300), Raj (₹300), Priya (₹300)
// Net: Raj owes Deep ₹300, Priya owes Deep ₹300
```

### Scenario 2: Testing Complex Group (4 people)

```javascript
const goaExpenses = getExpensesByGroup("group-002-goa-trip");
const balances = calculateGroupBalances("group-002-goa-trip");
// Test 4-way splits with multiple expenses
```

### Scenario 3: Testing Mixed Transactions

```javascript
const { transactions, balance } = getTransactionsByContact("contact-003");
// Kavita: ₹500 debit + ₹300 credit = -₹200 net (you owe ₹200)
```

## Benefits

✅ **No Schema Drift**: Types force consistency  
✅ **Faster Development**: Test UI without backend  
✅ **Better Tests**: Realistic edge cases included  
✅ **Documentation**: Types serve as API documentation  
✅ **Confidence**: Safe refactoring with type checking

---

Happy mocking! 🚀
