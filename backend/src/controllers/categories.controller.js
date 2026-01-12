import supabase from '../utils/supabase.js';
import { EXPENSE_CATEGORIES } from '../utils/categories.js';

// Get category-wise summary for current month
export const getCategorySummary = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Get current month's date range
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const monthStart = new Date(year, month, 1).toISOString().split('T')[0];
        const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0];

        if (supabase) {
            // Get transactions for this month from user's contacts
            const { data: contacts, error: contactsError } = await supabase
                .from('contacts')
                .select('id')
                .eq('user_id', userId);

            if (contactsError) throw contactsError;

            const contactIds = contacts.map(c => c.id);

            let transactionTotals = {};
            let expenseTotals = {};

            if (contactIds.length > 0) {
                // Get transactions for current month
                const { data: transactions, error: txnError } = await supabase
                    .from('transactions')
                    .select('category, amount, transaction_type')
                    .in('contact_id', contactIds)
                    .gte('date', monthStart)
                    .lte('date', monthEnd);

                if (txnError) throw txnError;

                // Aggregate transaction amounts by category
                transactions.forEach(txn => {
                    const cat = txn.category || 'other';
                    if (!transactionTotals[cat]) {
                        transactionTotals[cat] = { total: 0, count: 0 };
                    }
                    transactionTotals[cat].total += parseFloat(txn.amount);
                    transactionTotals[cat].count += 1;
                });
            }

            // Get group expenses for current month where user is a member
            const { data: groupMembers, error: membersError } = await supabase
                .from('group_members')
                .select('group_id')
                .eq('user_id', userId);

            if (membersError) throw membersError;

            const groupIds = groupMembers.map(gm => gm.group_id);

            if (groupIds.length > 0) {
                // Get expenses for current month
                const { data: expenses, error: expError } = await supabase
                    .from('expenses')
                    .select('category, amount')
                    .in('group_id', groupIds)
                    .gte('date', monthStart)
                    .lte('date', monthEnd);

                if (expError) throw expError;

                // Aggregate expense amounts by category
                expenses.forEach(exp => {
                    const cat = exp.category || 'other';
                    if (!expenseTotals[cat]) {
                        expenseTotals[cat] = { total: 0, count: 0 };
                    }
                    expenseTotals[cat].total += parseFloat(exp.amount);
                    expenseTotals[cat].count += 1;
                });
            }

            // Combine totals and build response
            const categorySummary = EXPENSE_CATEGORIES.map(cat => {
                const txnData = transactionTotals[cat.id] || { total: 0, count: 0 };
                const expData = expenseTotals[cat.id] || { total: 0, count: 0 };
                
                return {
                    id: cat.id,
                    label: cat.label,
                    icon: cat.icon,
                    transactionTotal: txnData.total.toFixed(2),
                    transactionCount: txnData.count,
                    expenseTotal: expData.total.toFixed(2),
                    expenseCount: expData.count,
                    combinedTotal: (txnData.total + expData.total).toFixed(2),
                    combinedCount: txnData.count + expData.count
                };
            }).filter(cat => parseFloat(cat.combinedTotal) > 0 || cat.combinedCount > 0);

            res.json({
                categories: categorySummary,
                month: month + 1,
                year: year,
                monthName: now.toLocaleString('default', { month: 'long' })
            });
        } else {
            // Mock response
            res.json({
                categories: [],
                month: month + 1,
                year: year,
                monthName: now.toLocaleString('default', { month: 'long' })
            });
        }
    } catch (error) {
        console.error('Get category summary error:', error);
        res.status(500).json({ error: 'Failed to get category summary' });
    }
};

// Get list of available categories
export const getCategories = async (req, res) => {
    res.json({ categories: EXPENSE_CATEGORIES });
};
