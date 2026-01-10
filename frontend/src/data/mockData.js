/**
 * Mock Data for CoBalance
 * 
 * This file contains realistic sample data that matches the Supabase schema exactly.
 * All types are validated against database.types.js to prevent schema drift.
 * 
 * @typedef {import('./types/database.types').User} User
 * @typedef {import('./types/database.types').Contact} Contact
 * @typedef {import('./types/database.types').Transaction} Transaction
 * @typedef {import('./types/database.types').Group} Group
 * @typedef {import('./types/database.types').GroupMember} GroupMember
 * @typedef {import('./types/database.types').Expense} Expense
 * @typedef {import('./types/database.types').Settlement} Settlement
 */

// ==================== USERS ====================

/** @type {User[]} */
export const mockUsers = [
  {
    id: 'user-001-deep-patel',
    mobile: '+919876543210',
    name: 'Deep Patel',
    language: 'en',
    created_at: '2024-01-01T10:00:00.000Z',
    updated_at: '2024-01-15T14:30:00.000Z'
  },
  {
    id: 'user-002-raj-sharma',
    mobile: '+919123456789',
    name: 'Raj Sharma',
    language: 'en',
    created_at: '2024-01-05T09:00:00.000Z',
    updated_at: '2024-01-10T11:00:00.000Z'
  },
  {
    id: 'user-003-priya-kumar',
    mobile: '+919988776655',
    name: 'Priya Kumar',
    language: 'en',
    created_at: '2024-01-08T14:20:00.000Z',
    updated_at: '2024-01-12T16:45:00.000Z'
  },
  {
    id: 'user-004-amit-singh',
    mobile: '+919765432108',
    name: 'Amit Singh',
    language: 'en',
    created_at: '2024-01-10T08:00:00.000Z',
    updated_at: '2024-01-14T10:00:00.000Z'
  },
  {
    id: 'user-005-sneha-reddy',
    mobile: '+919123987654',
    name: 'Sneha Reddy',
    language: 'en',
    created_at: '2024-01-12T12:00:00.000Z',
    updated_at: '2024-01-12T12:00:00.000Z'
  }
];

// ==================== CONTACTS (LEDGER) ====================

/** @type {Contact[]} */
export const mockContacts = [
  {
    id: 'contact-001',
    user_id: 'user-001-deep-patel',
    name: 'Ramesh Shop',
    type: 'customer',
    created_at: '2024-01-02T10:00:00.000Z',
    updated_at: '2024-01-02T10:00:00.000Z'
  },
  {
    id: 'contact-002',
    user_id: 'user-001-deep-patel',
    name: 'Suresh Electrician',
    type: 'supplier',
    created_at: '2024-01-03T11:30:00.000Z',
    updated_at: '2024-01-03T11:30:00.000Z'
  },
  {
    id: 'contact-003',
    user_id: 'user-001-deep-patel',
    name: 'Kavita Friend',
    type: 'friend',
    created_at: '2024-01-05T09:00:00.000Z',
    updated_at: '2024-01-05T09:00:00.000Z'
  },
  {
    id: 'contact-004',
    user_id: 'user-001-deep-patel',
    name: 'Office Supplies Ltd',
    type: 'supplier',
    created_at: '2024-01-07T14:00:00.000Z',
    updated_at: '2024-01-07T14:00:00.000Z'
  }
];

// ==================== TRANSACTIONS ====================

/** @type {Transaction[]} */
export const mockTransactions = [
  // Ramesh Shop owes you money (credit = you'll get)
  {
    id: 'txn-001',
    contact_id: 'contact-001',
    amount: '2500.00',
    transaction_type: 'credit',
    note: 'January supplies delivered',
    date: '2024-01-10',
    created_at: '2024-01-10T09:00:00.000Z',
    updated_at: '2024-01-10T09:00:00.000Z'
  },
  {
    id: 'txn-002',
    contact_id: 'contact-001',
    amount: '1200.00',
    transaction_type: 'credit',
    note: 'Extra order - rice bags',
    date: '2024-01-12',
    created_at: '2024-01-12T10:30:00.000Z',
    updated_at: '2024-01-12T10:30:00.000Z'
  },
  // You paid Suresh (debit = you owe)
  {
    id: 'txn-003',
    contact_id: 'contact-002',
    amount: '800.00',
    transaction_type: 'debit',
    note: 'Office wiring work',
    date: '2024-01-11',
    created_at: '2024-01-11T15:00:00.000Z',
    updated_at: '2024-01-11T15:00:00.000Z'
  },
  // Kavita Friend - mixed transactions
  {
    id: 'txn-004',
    contact_id: 'contact-003',
    amount: '500.00',
    transaction_type: 'debit',
    note: 'Lunch treat',
    date: '2024-01-08',
    created_at: '2024-01-08T13:00:00.000Z',
    updated_at: '2024-01-08T13:00:00.000Z'
  },
  {
    id: 'txn-005',
    contact_id: 'contact-003',
    amount: '300.00',
    transaction_type: 'credit',
    note: 'Movie tickets paid',
    date: '2024-01-14',
    created_at: '2024-01-14T19:00:00.000Z',
    updated_at: '2024-01-14T19:00:00.000Z'
  },
  // Office Supplies
  {
    id: 'txn-006',
    contact_id: 'contact-004',
    amount: '3500.00',
    transaction_type: 'debit',
    note: 'Stationery monthly order',
    date: '2024-01-15',
    created_at: '2024-01-15T11:00:00.000Z',
    updated_at: '2024-01-15T11:00:00.000Z'
  }
];

// ==================== GROUPS ====================

/** @type {Group[]} */
export const mockGroups = [
  {
    id: 'group-001-office-lunch',
    name: 'Office Lunch Group',
    created_by: 'user-001-deep-patel',
    created_at: '2024-01-05T10:00:00.000Z',
    updated_at: '2024-01-05T10:00:00.000Z'
  },
  {
    id: 'group-002-goa-trip',
    name: 'Goa Trip 2024',
    created_by: 'user-002-raj-sharma',
    created_at: '2024-01-08T14:00:00.000Z',
    updated_at: '2024-01-08T14:00:00.000Z'
  },
  {
    id: 'group-003-roommates',
    name: 'Apartment Roommates',
    created_by: 'user-003-priya-kumar',
    created_at: '2024-01-01T09:00:00.000Z',
    updated_at: '2024-01-01T09:00:00.000Z'
  }
];

// ==================== GROUP MEMBERS ====================

/** @type {GroupMember[]} */
export const mockGroupMembers = [
  // Office Lunch Group (3 members)
  {
    id: 'gm-001',
    group_id: 'group-001-office-lunch',
    user_id: 'user-001-deep-patel',
    joined_at: '2024-01-05T10:00:00.000Z'
  },
  {
    id: 'gm-002',
    group_id: 'group-001-office-lunch',
    user_id: 'user-002-raj-sharma',
    joined_at: '2024-01-05T10:05:00.000Z'
  },
  {
    id: 'gm-003',
    group_id: 'group-001-office-lunch',
    user_id: 'user-003-priya-kumar',
    joined_at: '2024-01-05T10:10:00.000Z'
  },
  // Goa Trip (4 members)
  {
    id: 'gm-004',
    group_id: 'group-002-goa-trip',
    user_id: 'user-001-deep-patel',
    joined_at: '2024-01-08T14:00:00.000Z'
  },
  {
    id: 'gm-005',
    group_id: 'group-002-goa-trip',
    user_id: 'user-002-raj-sharma',
    joined_at: '2024-01-08T14:00:00.000Z'
  },
  {
    id: 'gm-006',
    group_id: 'group-002-goa-trip',
    user_id: 'user-003-priya-kumar',
    joined_at: '2024-01-08T14:05:00.000Z'
  },
  {
    id: 'gm-007',
    group_id: 'group-002-goa-trip',
    user_id: 'user-004-amit-singh',
    joined_at: '2024-01-08T14:10:00.000Z'
  },
  // Roommates (3 members)
  {
    id: 'gm-008',
    group_id: 'group-003-roommates',
    user_id: 'user-003-priya-kumar',
    joined_at: '2024-01-01T09:00:00.000Z'
  },
  {
    id: 'gm-009',
    group_id: 'group-003-roommates',
    user_id: 'user-004-amit-singh',
    joined_at: '2024-01-01T09:05:00.000Z'
  },
  {
    id: 'gm-010',
    group_id: 'group-003-roommates',
    user_id: 'user-005-sneha-reddy',
    joined_at: '2024-01-01T09:10:00.000Z'
  }
];

// ==================== EXPENSES ====================

/** @type {Expense[]} */
export const mockExpenses = [
  // Office Lunch - Equal split between 3 people
  {
    id: 'exp-001',
    group_id: 'group-001-office-lunch',
    description: 'Team Lunch - Chinese Restaurant',
    amount: '900.00',
    paid_by: 'user-001-deep-patel',
    split_between: [
      { user_id: 'user-001-deep-patel', amount: '300.00' },
      { user_id: 'user-002-raj-sharma', amount: '300.00' },
      { user_id: 'user-003-priya-kumar', amount: '300.00' }
    ],
    date: '2024-01-10',
    created_at: '2024-01-10T14:00:00.000Z',
    updated_at: '2024-01-10T14:00:00.000Z'
  },
  {
    id: 'exp-002',
    group_id: 'group-001-office-lunch',
    description: 'Coffee and Snacks',
    amount: '450.00',
    paid_by: 'user-002-raj-sharma',
    split_between: [
      { user_id: 'user-001-deep-patel', amount: '150.00' },
      { user_id: 'user-002-raj-sharma', amount: '150.00' },
      { user_id: 'user-003-priya-kumar', amount: '150.00' }
    ],
    date: '2024-01-12',
    created_at: '2024-01-12T16:30:00.000Z',
    updated_at: '2024-01-12T16:30:00.000Z'
  },
  // Goa Trip - Complex split with 4 people
  {
    id: 'exp-003',
    group_id: 'group-002-goa-trip',
    description: 'Hotel Booking - 2 Nights',
    amount: '12000.00',
    paid_by: 'user-002-raj-sharma',
    split_between: [
      { user_id: 'user-001-deep-patel', amount: '3000.00' },
      { user_id: 'user-002-raj-sharma', amount: '3000.00' },
      { user_id: 'user-003-priya-kumar', amount: '3000.00' },
      { user_id: 'user-004-amit-singh', amount: '3000.00' }
    ],
    date: '2024-01-09',
    created_at: '2024-01-09T10:00:00.000Z',
    updated_at: '2024-01-09T10:00:00.000Z'
  },
  {
    id: 'exp-004',
    group_id: 'group-002-goa-trip',
    description: 'Cab to Airport',
    amount: '2400.00',
    paid_by: 'user-001-deep-patel',
    split_between: [
      { user_id: 'user-001-deep-patel', amount: '600.00' },
      { user_id: 'user-002-raj-sharma', amount: '600.00' },
      { user_id: 'user-003-priya-kumar', amount: '600.00' },
      { user_id: 'user-004-amit-singh', amount: '600.00' }
    ],
    date: '2024-01-09',
    created_at: '2024-01-09T06:00:00.000Z',
    updated_at: '2024-01-09T06:00:00.000Z'
  },
  {
    id: 'exp-005',
    group_id: 'group-002-goa-trip',
    description: 'Beach Shack Dinner',
    amount: '3600.00',
    paid_by: 'user-003-priya-kumar',
    split_between: [
      { user_id: 'user-001-deep-patel', amount: '900.00' },
      { user_id: 'user-002-raj-sharma', amount: '900.00' },
      { user_id: 'user-003-priya-kumar', amount: '900.00' },
      { user_id: 'user-004-amit-singh', amount: '900.00' }
    ],
    date: '2024-01-10',
    created_at: '2024-01-10T20:00:00.000Z',
    updated_at: '2024-01-10T20:00:00.000Z'
  },
  // Roommates - Rent and utilities
  {
    id: 'exp-006',
    group_id: 'group-003-roommates',
    description: 'January Rent',
    amount: '30000.00',
    paid_by: 'user-003-priya-kumar',
    split_between: [
      { user_id: 'user-003-priya-kumar', amount: '10000.00' },
      { user_id: 'user-004-amit-singh', amount: '10000.00' },
      { user_id: 'user-005-sneha-reddy', amount: '10000.00' }
    ],
    date: '2024-01-01',
    created_at: '2024-01-01T10:00:00.000Z',
    updated_at: '2024-01-01T10:00:00.000Z'
  },
  {
    id: 'exp-007',
    group_id: 'group-003-roommates',
    description: 'Electricity Bill - December',
    amount: '2100.00',
    paid_by: 'user-004-amit-singh',
    split_between: [
      { user_id: 'user-003-priya-kumar', amount: '700.00' },
      { user_id: 'user-004-amit-singh', amount: '700.00' },
      { user_id: 'user-005-sneha-reddy', amount: '700.00' }
    ],
    date: '2024-01-05',
    created_at: '2024-01-05T15:00:00.000Z',
    updated_at: '2024-01-05T15:00:00.000Z'
  },
  {
    id: 'exp-008',
    group_id: 'group-003-roommates',
    description: 'Groceries - Weekly Shopping',
    amount: '3000.00',
    paid_by: 'user-005-sneha-reddy',
    split_between: [
      { user_id: 'user-003-priya-kumar', amount: '1000.00' },
      { user_id: 'user-004-amit-singh', amount: '1000.00' },
      { user_id: 'user-005-sneha-reddy', amount: '1000.00' }
    ],
    date: '2024-01-07',
    created_at: '2024-01-07T11:00:00.000Z',
    updated_at: '2024-01-07T11:00:00.000Z'
  }
];

// ==================== SETTLEMENTS ====================

/** @type {Settlement[]} */
export const mockSettlements = [
  // Office Lunch - Raj and Priya owe Deep
  {
    id: 'settlement-001',
    group_id: 'group-001-office-lunch',
    from_user: 'user-002-raj-sharma',
    to_user: 'user-001-deep-patel',
    amount: '150.00',
    status: 'pending',
    paid_at: null,
    created_at: '2024-01-13T10:00:00.000Z',
    updated_at: '2024-01-13T10:00:00.000Z'
  },
  {
    id: 'settlement-002',
    group_id: 'group-001-office-lunch',
    from_user: 'user-003-priya-kumar',
    to_user: 'user-001-deep-patel',
    amount: '150.00',
    status: 'pending',
    paid_at: null,
    created_at: '2024-01-13T10:00:00.000Z',
    updated_at: '2024-01-13T10:00:00.000Z'
  },
  // Goa Trip - Complex settlement
  {
    id: 'settlement-003',
    group_id: 'group-002-goa-trip',
    from_user: 'user-001-deep-patel',
    to_user: 'user-002-raj-sharma',
    amount: '2400.00',
    status: 'paid',
    paid_at: '2024-01-14T12:00:00.000Z',
    created_at: '2024-01-13T14:00:00.000Z',
    updated_at: '2024-01-14T12:00:00.000Z'
  },
  {
    id: 'settlement-004',
    group_id: 'group-002-goa-trip',
    from_user: 'user-004-amit-singh',
    to_user: 'user-002-raj-sharma',
    amount: '2400.00',
    status: 'pending',
    paid_at: null,
    created_at: '2024-01-13T14:00:00.000Z',
    updated_at: '2024-01-13T14:00:00.000Z'
  },
  // Roommates - Rent settlement
  {
    id: 'settlement-005',
    group_id: 'group-003-roommates',
    from_user: 'user-004-amit-singh',
    to_user: 'user-003-priya-kumar',
    amount: '9300.00',
    status: 'pending',
    paid_at: null,
    created_at: '2024-01-08T10:00:00.000Z',
    updated_at: '2024-01-08T10:00:00.000Z'
  },
  {
    id: 'settlement-006',
    group_id: 'group-003-roommates',
    from_user: 'user-005-sneha-reddy',
    to_user: 'user-003-priya-kumar',
    amount: '9300.00',
    status: 'pending',
    paid_at: null,
    created_at: '2024-01-08T10:00:00.000Z',
    updated_at: '2024-01-08T10:00:00.000Z'
  }
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Get user by ID
 * @param {string} userId 
 * @returns {User|undefined}
 */
export function getUserById(userId) {
  return mockUsers.find(u => u.id === userId);
}

/**
 * Get contacts for a user
 * @param {string} userId 
 * @returns {Contact[]}
 */
export function getContactsByUser(userId) {
  return mockContacts.filter(c => c.user_id === userId);
}

/**
 * Get transactions for a contact with balance calculation
 * @param {string} contactId 
 * @returns {{transactions: Transaction[], balance: number}}
 */
export function getTransactionsByContact(contactId) {
  const transactions = mockTransactions.filter(t => t.contact_id === contactId);
  
  const balance = transactions.reduce((sum, txn) => {
    const amount = parseFloat(txn.amount);
    return txn.transaction_type === 'credit' ? sum + amount : sum - amount;
  }, 0);
  
  return { transactions, balance };
}

/**
 * Get groups where user is a member
 * @param {string} userId 
 * @returns {Group[]}
 */
export function getGroupsByUser(userId) {
  const userGroupIds = mockGroupMembers
    .filter(gm => gm.user_id === userId)
    .map(gm => gm.group_id);
  
  return mockGroups.filter(g => userGroupIds.includes(g.id));
}

/**
 * Get members of a group
 * @param {string} groupId 
 * @returns {User[]}
 */
export function getGroupMembers(groupId) {
  const memberIds = mockGroupMembers
    .filter(gm => gm.group_id === groupId)
    .map(gm => gm.user_id);
  
  return mockUsers.filter(u => memberIds.includes(u.id));
}

/**
 * Get expenses for a group
 * @param {string} groupId 
 * @returns {Expense[]}
 */
export function getExpensesByGroup(groupId) {
  return mockExpenses.filter(e => e.group_id === groupId);
}

/**
 * Calculate user balances in a group
 * @param {string} groupId 
 * @returns {Map<string, number>} Map of user_id to balance
 */
export function calculateGroupBalances(groupId) {
  const expenses = getExpensesByGroup(groupId);
  const balances = new Map();
  
  expenses.forEach(expense => {
    // Person who paid gets positive balance
    const currentPaid = balances.get(expense.paid_by) || 0;
    balances.set(expense.paid_by, currentPaid + parseFloat(expense.amount));
    
    // People in split owe money (negative balance)
    expense.split_between.forEach(split => {
      const currentOwed = balances.get(split.user_id) || 0;
      balances.set(split.user_id, currentOwed - parseFloat(split.amount));
    });
  });
  
  return balances;
}

/**
 * Get dashboard summary for current user
 * @returns {{totalYouGet: string, totalYouOwe: string, netBalance: string, activity: any[]}}
 */
export function getDashboardSummary() {
  // Calculate from contacts
  const currentUserId = 'user-001-deep-patel';
  const contacts = getContactsByUser(currentUserId);
  
  let totalCredit = 0;
  let totalDebit = 0;
  
  contacts.forEach(contact => {
    const { balance } = getTransactionsByContact(contact.id);
    if (balance > 0) totalCredit += balance;
    if (balance < 0) totalDebit += Math.abs(balance);
  });
  
  return {
    totalYouGet: totalCredit.toFixed(2),
    totalYouOwe: totalDebit.toFixed(2),
    netBalance: (totalCredit - totalDebit).toFixed(2),
    activity: []
  };
}

export default {
  mockUsers,
  mockContacts,
  mockTransactions,
  mockGroups,
  mockGroupMembers,
  mockExpenses,
  mockSettlements,
  getUserById,
  getContactsByUser,
  getTransactionsByContact,
  getGroupsByUser,
  getGroupMembers,
  getExpensesByGroup,
  calculateGroupBalances,
  getDashboardSummary
};
