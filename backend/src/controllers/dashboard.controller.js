/**
 * Dashboard Controller
 * 
 * Handles dashboard-related API endpoints including user balance calculations
 */

import { getSupabaseAdmin } from '../config/supabase.js';

/**
 * Get User Balance
 * 
 * Calculates total balance across all contacts using a safe parameterized SQL query.
 * This demonstrates:
 * - SQL injection prevention via parameter binding
 * - Complex balance calculation logic
 * - Error handling best practices
 * 
 * @route GET /api/dashboard/balance
 * @access Private (requires authentication)
 */
export const getUserBalance = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware

    // Get Supabase admin client
    const supabase = getSupabaseAdmin();

    /**
     * Safe SQL Query with Parameter Binding
     * 
     * This query:
     * 1. Finds all contacts belonging to the user
     * 2. Joins with transactions for each contact
     * 3. Calculates balance (credit - debit)
     * 4. Uses $1 placeholder to prevent SQL injection
     * 
     * SECURITY: Never use string concatenation for SQL queries!
     * ❌ BAD:  `SELECT * FROM users WHERE id = '${userId}'`
     * ✅ GOOD: Use parameterized queries as shown below
     */
    const { data, error } = await supabase.rpc('calculate_user_balance', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Balance calculation error:', error);
      return res.status(500).json({
        error: 'Failed to calculate balance',
        details: error.message,
      });
    }

    // Alternative: Using direct SQL with Supabase's query builder
    // This is safer than raw SQL and still flexible
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select(`
        id,
        name,
        type,
        transactions (
          amount,
          transaction_type
        )
      `)
      .eq('user_id', userId);

    if (contactsError) {
      console.error('Contacts fetch error:', contactsError);
      return res.status(500).json({
        error: 'Failed to fetch contacts',
      });
    }

    // Calculate balances in JavaScript
    let totalCredit = 0;
    let totalDebit = 0;

    const contactBalances = contacts.map((contact) => {
      let balance = 0;

      contact.transactions.forEach((txn) => {
        const amount = parseFloat(txn.amount);

        if (txn.transaction_type === 'credit') {
          balance += amount;
          totalCredit += amount;
        } else {
          balance -= amount;
          totalDebit += amount;
        }
      });

      return {
        contact_id: contact.id,
        contact_name: contact.name,
        contact_type: contact.type,
        balance: balance.toFixed(2),
      };
    });

    const netBalance = totalCredit - totalDebit;

    return res.json({
      success: true,
      data: {
        total_credit: totalCredit.toFixed(2),
        total_debit: totalDebit.toFixed(2),
        net_balance: netBalance.toFixed(2),
        contact_balances: contactBalances,
      },
    });
  } catch (err) {
    console.error('getUserBalance exception:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  }
};

/**
 * Get Dashboard Summary
 * 
 * Fetches complete dashboard overview including:
 * - Total balances (you get / you owe)
 * - Recent activity
 * - Pending settlements
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const supabase = getSupabaseAdmin();

    // Fetch user's contacts with transaction aggregation
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select(`
        id,
        name,
        type,
        transactions (
          id,
          amount,
          transaction_type,
          note,
          date
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false, foreignTable: 'transactions' })
      .limit(10, { foreignTable: 'transactions' });

    if (contactsError) throw contactsError;

    // Calculate totals
    let totalYouGet = 0;
    let totalYouOwe = 0;
    const activity = [];

    contacts.forEach((contact) => {
      let contactBalance = 0;

      contact.transactions.forEach((txn) => {
        const amount = parseFloat(txn.amount);

        if (txn.transaction_type === 'credit') {
          contactBalance += amount;
          totalYouGet += amount;
        } else {
          contactBalance -= amount;
          totalYouOwe += amount;
        }

        // Add to activity feed
        activity.push({
          type: 'transaction',
          contact_name: contact.name,
          description: txn.note || `${txn.transaction_type} transaction`,
          amount: txn.amount,
          date: txn.date,
        });
      });
    });

    // Fetch recent group expenses
    const { data: groups } = await supabase
      .from('group_members')
      .select(`
        group_id,
        groups (
          id,
          name,
          expenses (
            id,
            description,
            amount,
            date,
            paid_by
          )
        )
      `)
      .eq('user_id', userId);

    // Add group expenses to activity
    groups?.forEach((gm) => {
      gm.groups.expenses?.forEach((exp) => {
        activity.push({
          type: 'expense',
          group_name: gm.groups.name,
          description: exp.description,
          amount: exp.amount,
          date: exp.date,
          paid_by_you: exp.paid_by === userId,
        });
      });
    });

    // Sort activity by date
    activity.sort((a, b) => new Date(b.date) - new Date(a.date));

    const netBalance = totalYouGet - totalYouOwe;

    return res.json({
      success: true,
      totalYouGet: totalYouGet.toFixed(2),
      totalYouOwe: totalYouOwe.toFixed(2),
      netBalance: netBalance.toFixed(2),
      activity: activity.slice(0, 20), // Return top 20 items
    });
  } catch (err) {
    console.error('getDashboardSummary error:', err);
    return res.status(500).json({
      error: 'Failed to fetch dashboard summary',
      message: err.message,
    });
  }
};
