/**
 * CoBalance Database Type Definitions
 * Generated from Supabase PostgreSQL Schema
 * 
 * These JSDoc types ensure mock data stays in sync with the database schema.
 * Import these types in your mock data files to get type checking and autocomplete.
 */

/**
 * @typedef {string} UUID
 * Represents a UUID v4 string (e.g., "123e4567-e89b-12d3-a456-426614174000")
 */

/**
 * @typedef {string} ISODateString
 * ISO 8601 date string (e.g., "2024-01-15T10:30:00.000Z")
 */

/**
 * @typedef {string} DateString
 * Date-only string (e.g., "2024-01-15")
 */

// ==================== USER TYPES ====================

/**
 * @typedef {Object} User
 * @property {UUID} id - Unique user identifier
 * @property {string} mobile - Mobile number with country code (max 15 chars)
 * @property {string|null} name - User's display name (max 100 chars)
 * @property {string} language - Language preference ('en', 'hi', etc., max 10 chars)
 * @property {ISODateString} created_at - Account creation timestamp
 * @property {ISODateString} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} OTPCode
 * @property {UUID} id - Unique OTP record identifier
 * @property {string} mobile - Mobile number (max 15 chars)
 * @property {string} otp - 6-digit OTP code
 * @property {ISODateString} expires_at - OTP expiration timestamp
 * @property {boolean} verified - Whether OTP has been verified
 * @property {ISODateString} created_at - OTP generation timestamp
 */

// ==================== LEDGER TYPES ====================

/**
 * @typedef {'customer'|'friend'|'supplier'|'other'} ContactType
 * Types of contacts in the ledger
 */

/**
 * @typedef {Object} Contact
 * @property {UUID} id - Unique contact identifier
 * @property {UUID} user_id - ID of user who owns this contact
 * @property {string} name - Contact name (max 100 chars)
 * @property {ContactType} type - Contact category
 * @property {ISODateString} created_at - Contact creation timestamp
 * @property {ISODateString} updated_at - Last update timestamp
 */

/**
 * @typedef {'credit'|'debit'} TransactionType
 * Transaction types: credit = money you'll receive, debit = money you owe
 */

/**
 * @typedef {Object} Transaction
 * @property {UUID} id - Unique transaction identifier
 * @property {UUID} contact_id - ID of associated contact
 * @property {string} amount - Transaction amount as decimal string (e.g., "1234.56")
 * @property {TransactionType} transaction_type - Credit or debit
 * @property {string|null} note - Optional transaction description
 * @property {DateString} date - Transaction date
 * @property {ISODateString} created_at - Record creation timestamp
 * @property {ISODateString} updated_at - Last update timestamp
 */

// ==================== GROUP TYPES ====================

/**
 * @typedef {Object} Group
 * @property {UUID} id - Unique group identifier
 * @property {string} name - Group name (max 100 chars)
 * @property {UUID} created_by - ID of user who created the group
 * @property {ISODateString} created_at - Group creation timestamp
 * @property {ISODateString} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} GroupMember
 * @property {UUID} id - Unique membership record identifier
 * @property {UUID} group_id - ID of the group
 * @property {UUID} user_id - ID of the member
 * @property {ISODateString} joined_at - When user joined the group
 */

/**
 * @typedef {Object} ExpenseSplitItem
 * @property {UUID} user_id - User ID in the split
 * @property {string} amount - Amount owed by this user (decimal string)
 */

/**
 * @typedef {Object} Expense
 * @property {UUID} id - Unique expense identifier
 * @property {UUID} group_id - ID of the group
 * @property {string} description - Expense description (max 200 chars)
 * @property {string} amount - Total expense amount (decimal string)
 * @property {UUID} paid_by - ID of user who paid
 * @property {ExpenseSplitItem[]} split_between - Array of split details (stored as JSONB)
 * @property {DateString} date - Expense date
 * @property {ISODateString} created_at - Record creation timestamp
 * @property {ISODateString} updated_at - Last update timestamp
 */

// ==================== SETTLEMENT TYPES ====================

/**
 * @typedef {'pending'|'paid'} SettlementStatus
 * Status of a settlement transaction
 */

/**
 * @typedef {Object} Settlement
 * @property {UUID} id - Unique settlement identifier
 * @property {UUID} group_id - ID of the group
 * @property {UUID} from_user - ID of user who owes money
 * @property {UUID} to_user - ID of user who should receive money
 * @property {string} amount - Settlement amount (decimal string)
 * @property {SettlementStatus} status - Payment status
 * @property {ISODateString|null} paid_at - When settlement was marked as paid
 * @property {ISODateString} created_at - Record creation timestamp
 * @property {ISODateString} updated_at - Last update timestamp
 */

// ==================== COMPUTED/VIEW TYPES ====================

/**
 * @typedef {Object} ContactWithBalance
 * Extended contact with computed balance
 * @property {UUID} id
 * @property {UUID} user_id
 * @property {string} name
 * @property {ContactType} type
 * @property {string} balance - Computed balance (decimal string, positive = you get, negative = you owe)
 * @property {ISODateString} created_at
 * @property {ISODateString} updated_at
 */

/**
 * @typedef {Object} GroupWithMembers
 * Extended group with member details
 * @property {UUID} id
 * @property {string} name
 * @property {UUID} created_by
 * @property {User[]} members - Array of group members
 * @property {number} memberCount - Total number of members
 * @property {ISODateString} created_at
 * @property {ISODateString} updated_at
 */

/**
 * @typedef {Object} UserBalance
 * User's balance within a group
 * @property {UUID} user_id
 * @property {string} name
 * @property {string} mobile
 * @property {string} balance - Computed balance in the group (decimal string)
 */

/**
 * @typedef {Object} DashboardSummary
 * Dashboard overview data
 * @property {string} totalYouGet - Total amount you'll receive (decimal string)
 * @property {string} totalYouOwe - Total amount you owe (decimal string)
 * @property {string} netBalance - Net balance (decimal string)
 * @property {ActivityItem[]} activity - Recent activity feed
 */

/**
 * @typedef {Object} ActivityItem
 * Recent activity item for dashboard
 * @property {'transaction'|'expense'} type
 * @property {string} description
 * @property {string} amount - Decimal string
 * @property {DateString} date
 * @property {string|null} contactName - For transactions
 * @property {string|null} groupName - For expenses
 */

export default {};
