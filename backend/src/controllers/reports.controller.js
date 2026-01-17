/**
 * Reports Controller
 * 
 * Handles monthly reporting API endpoints
 */

import supabase from '../utils/supabase.js';

/**
 * Get Monthly Report
 * 
 * Returns daily totals, monthly summary, and transactions for a given month/year.
 * 
 * @route GET /api/reports/monthly?month=<1-12>&year=<YYYY>
 * @access Private (requires authentication)
 */
export const getMonthlyReport = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { month, year } = req.query;

        // Parse and validate month/year
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);

        if (!monthNum || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ error: 'Invalid month. Must be 1-12.' });
        }

        if (!yearNum || yearNum < 2000 || yearNum > 2100) {
            return res.status(400).json({ error: 'Invalid year.' });
        }

        // Calculate date range for the month
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0); // Last day of month
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        const daysInMonth = endDate.getDate();

        if (supabase) {
            // Get all contacts for the user with their transactions for the month
            const { data: contacts, error: contactsError } = await supabase
                .from('contacts')
                .select(`
                    id,
                    name,
                    transactions (
                        id,
                        amount,
                        transaction_type,
                        note,
                        date,
                        category
                    )
                `)
                .eq('user_id', userId);

            if (contactsError) throw contactsError;

            // Initialize daily totals for each day of the month
            const dailyTotals = [];
            for (let day = 1; day <= daysInMonth; day++) {
                dailyTotals.push({ day, spent: 0, received: 0 });
            }

            let totalSpent = 0;
            let totalReceived = 0;
            const monthTransactions = [];

            // Process transactions
            contacts.forEach(contact => {
                contact.transactions.forEach(txn => {
                    const txnDate = new Date(txn.date);
                    
                    // Check if transaction is in the selected month
                    if (txnDate >= startDate && txnDate <= endDate) {
                        const day = txnDate.getDate();
                        const amount = parseFloat(txn.amount);

                        // credit = money received, debit = money spent
                        if (txn.transaction_type === 'credit') {
                            dailyTotals[day - 1].received += amount;
                            totalReceived += amount;
                        } else {
                            dailyTotals[day - 1].spent += amount;
                            totalSpent += amount;
                        }

                        // Add to transactions list
                        monthTransactions.push({
                            id: txn.id,
                            contactName: contact.name,
                            amount: txn.amount,
                            type: txn.transaction_type,
                            note: txn.note,
                            date: txn.date,
                            category: txn.category || 'other'
                        });
                    }
                });
            });

            // Sort transactions by date (newest first)
            monthTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Format daily totals
            const formattedDailyTotals = dailyTotals.map(d => ({
                day: d.day,
                spent: d.spent.toFixed(2),
                received: d.received.toFixed(2)
            }));

            // Calculate today's spending (if current month)
            const now = new Date();
            let todaySpending = null;
            if (now.getMonth() + 1 === monthNum && now.getFullYear() === yearNum) {
                const today = now.getDate();
                todaySpending = dailyTotals[today - 1].spent.toFixed(2);
            }

            return res.json({
                success: true,
                month: monthNum,
                year: yearNum,
                daysInMonth,
                dailyTotals: formattedDailyTotals,
                monthlyTotals: {
                    spent: totalSpent.toFixed(2),
                    received: totalReceived.toFixed(2),
                    net: (totalReceived - totalSpent).toFixed(2)
                },
                todaySpending,
                transactions: monthTransactions
            });
        } else {
            // Mock response for development without DB
            const dailyTotals = [];
            for (let day = 1; day <= daysInMonth; day++) {
                dailyTotals.push({
                    day,
                    spent: '0.00',
                    received: '0.00'
                });
            }

            return res.json({
                success: true,
                month: monthNum,
                year: yearNum,
                daysInMonth,
                dailyTotals,
                monthlyTotals: {
                    spent: '0.00',
                    received: '0.00',
                    net: '0.00'
                },
                todaySpending: null,
                transactions: []
            });
        }
    } catch (err) {
        console.error('getMonthlyReport error:', err);
        return res.status(500).json({
            error: 'Failed to fetch monthly report',
            message: err.message
        });
    }
};
