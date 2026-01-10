/**
 * Contact Profile Controller
 * 
 * Provides unified view of a contact combining:
 * - Ledger transactions (business/personal)
 * - Group expenses (shared splits)
 * 
 * Handles edge case: Contact may not have user account yet (link by phone)
 */

import { getSupabaseAdmin } from '../config/supabase.js';

/**
 * Get Unified Contact Profile
 * 
 * Combines ledger balance and group balances for a single contact
 * 
 * @route GET /api/contacts/:contactId/profile
 * @access Private
 */
export const getContactProfile = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.userId;
    const supabase = getSupabaseAdmin();

    // ========== STEP 1: Verify Contact Ownership ==========
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, name, type, mobile')
      .eq('id', contactId)
      .eq('user_id', userId)
      .single();

    if (contactError || !contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // ========== STEP 2: Calculate Ledger Balance ==========
    const { data: transactions, error: txnError } = await supabase
      .from('transactions')
      .select('amount, transaction_type, note, date, created_at')
      .eq('contact_id', contactId)
      .order('date', { ascending: false })
      .limit(50);

    if (txnError) throw txnError;

    let ledgerBalance = 0;
    const ledgerHistory = (transactions || []).map(txn => {
      const amount = parseFloat(txn.amount);
      
      if (txn.transaction_type === 'credit') {
        ledgerBalance += amount;
      } else {
        ledgerBalance -= amount;
      }

      return {
        type: 'ledger',
        description: txn.note || `${txn.transaction_type} transaction`,
        amount: txn.amount,
        transaction_type: txn.transaction_type,
        date: txn.date,
        created_at: txn.created_at
      };
    });

    // ========== STEP 3: Find Contact's User Account ==========
    // Try to match contact by mobile number
    const { data: contactUser } = await supabase
      .from('users')
      .select('id, mobile, name')
      .eq('mobile', contact.mobile)
      .single();

    const contactUserId = contactUser?.id || null;

    // ========== STEP 4: Find Shared Groups ==========
    let sharedGroups = [];
    let groupBalance = 0;
    let groupActivity = [];

    if (contactUserId) {
      // Get groups where BOTH current user AND contact are members
      const { data: userGroups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

      const { data: contactGroups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', contactUserId);

      const userGroupIds = (userGroups || []).map(g => g.group_id);
      const contactGroupIds = (contactGroups || []).map(g => g.group_id);

      // Find intersection (shared groups)
      const sharedGroupIds = userGroupIds.filter(id => contactGroupIds.includes(id));

      if (sharedGroupIds.length > 0) {
        // Fetch shared group details
        const { data: groupsData } = await supabase
          .from('groups')
          .select('id, name, created_at')
          .in('id', sharedGroupIds);

        sharedGroups = groupsData || [];

        // ========== STEP 5: Calculate Group Balances ==========
        for (const group of sharedGroups) {
          const { data: expenses } = await supabase
            .from('expenses')
            .select('id, description, amount, paid_by, split_between, date, created_at')
            .eq('group_id', group.id)
            .order('date', { ascending: false });

          let groupNet = 0;

          (expenses || []).forEach(expense => {
            const totalAmount = parseFloat(expense.amount);
            const paidByCurrentUser = expense.paid_by === userId;
            const paidByContact = expense.paid_by === contactUserId;

            // Find split amounts
            const userSplit = expense.split_between.find(s => s.user_id === userId);
            const contactSplit = expense.split_between.find(s => s.user_id === contactUserId);

            const userOwes = userSplit ? parseFloat(userSplit.amount) : 0;
            const contactOwes = contactSplit ? parseFloat(contactSplit.amount) : 0;

            // Calculate net for this expense
            if (paidByCurrentUser) {
              // Current user paid, contact owes their split
              groupNet += contactOwes;
            } else if (paidByContact) {
              // Contact paid, current user owes their split
              groupNet -= userOwes;
            }

            // Add to activity log
            groupActivity.push({
              type: 'group',
              group_id: group.id,
              group_name: group.name,
              description: expense.description,
              amount: expense.amount,
              paid_by_you: paidByCurrentUser,
              paid_by_contact: paidByContact,
              your_split: userOwes.toFixed(2),
              contact_split: contactOwes.toFixed(2),
              date: expense.date,
              created_at: expense.created_at
            });
          });

          groupBalance += groupNet;
          group.balance = groupNet.toFixed(2);
        }
      }
    }

    // ========== STEP 6: Calculate Total Net Balance ==========
    const totalNetBalance = ledgerBalance + groupBalance;

    // ========== STEP 7: Combine Activity Log ==========
    const allActivity = [...ledgerHistory, ...groupActivity]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 30); // Last 30 items

    // ========== STEP 8: Build Response ==========
    return res.json({
      success: true,
      contact: {
        id: contact.id,
        name: contact.name,
        type: contact.type,
        mobile: contact.mobile,
        has_user_account: !!contactUserId,
        user_id: contactUserId
      },
      balance: {
        total_net_balance: totalNetBalance.toFixed(2),
        ledger_balance: ledgerBalance.toFixed(2),
        group_balance: groupBalance.toFixed(2)
      },
      shared_groups: sharedGroups,
      recent_activity: allActivity,
      summary: {
        total_transactions: transactions?.length || 0,
        shared_groups_count: sharedGroups.length,
        you_get: totalNetBalance > 0 ? totalNetBalance.toFixed(2) : '0.00',
        you_owe: totalNetBalance < 0 ? Math.abs(totalNetBalance).toFixed(2) : '0.00'
      }
    });

  } catch (err) {
    console.error('getContactProfile error:', err);
    return res.status(500).json({
      error: 'Failed to fetch contact profile',
      message: err.message
    });
  }
};

/**
 * Settle Contact Balance
 * 
 * Creates settlement records for both ledger and group balances
 * 
 * @route POST /api/contacts/:contactId/settle
 * @access Private
 */
export const settleContactBalance = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { amount, note } = req.body;
    const userId = req.user.userId;
    const supabase = getSupabaseAdmin();

    // Verify contact ownership
    const { data: contact } = await supabase
      .from('contacts')
      .select('id, name, mobile')
      .eq('id', contactId)
      .eq('user_id', userId)
      .single();

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Find contact's user account
    const { data: contactUser } = await supabase
      .from('users')
      .select('id')
      .eq('mobile', contact.mobile)
      .single();

    // Create settlement transaction in ledger
    const settlementAmount = parseFloat(amount);
    const transactionType = settlementAmount > 0 ? 'debit' : 'credit';

    const { data: transaction, error: txnError } = await supabase
      .from('transactions')
      .insert({
        contact_id: contactId,
        amount: Math.abs(settlementAmount).toFixed(2),
        transaction_type: transactionType,
        note: note || `Settlement (Total: ₹${Math.abs(settlementAmount).toFixed(2)})`,
        date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (txnError) throw txnError;

    // If contact has user account, create group settlements
    if (contactUser) {
      // Find shared groups with pending settlements
      const { data: userGroups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

      const { data: contactGroups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', contactUser.id);

      const userGroupIds = (userGroups || []).map(g => g.group_id);
      const contactGroupIds = (contactGroups || []).map(g => g.group_id);
      const sharedGroupIds = userGroupIds.filter(id => contactGroupIds.includes(id));

      // Create settlement records for each shared group
      for (const groupId of sharedGroupIds) {
        await supabase.from('settlements').insert({
          group_id: groupId,
          from_user: settlementAmount > 0 ? userId : contactUser.id,
          to_user: settlementAmount > 0 ? contactUser.id : userId,
          amount: Math.abs(settlementAmount).toFixed(2),
          status: 'paid',
          paid_at: new Date().toISOString()
        });
      }
    }

    return res.json({
      success: true,
      message: 'Settlement recorded successfully',
      transaction
    });

  } catch (err) {
    console.error('settleContactBalance error:', err);
    return res.status(500).json({
      error: 'Failed to settle balance',
      message: err.message
    });
  }
};
