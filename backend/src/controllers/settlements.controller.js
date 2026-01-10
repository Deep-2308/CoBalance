import supabase from '../utils/supabase.js';
import { simplifyBalances } from '../services/balance-simplification.service.js';

// Get simplified settlements for a group
export const getGroupSettlements = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.userId;

        if (supabase) {
            // Verify membership
            const { data: membership } = await supabase
                .from('group_members')
                .select('*')
                .eq('group_id', groupId)
                .eq('user_id', userId)
                .single();

            if (!membership) {
                return res.status(403).json({ error: 'Not a member of this group' });
            }

            // Get all expenses
            const { data: expenses, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('group_id', groupId);

            if (error) throw error;

            // Get all members
            const { data: memberRecords } = await supabase
                .from('group_members')
                .select('user_id, users (id, name, mobile)')
                .eq('group_id', groupId);

            const members = memberRecords.map(m => m.users);

            // Calculate balances
            const balances = {};
            members.forEach(member => {
                balances[member.id] = {
                    user_id: member.id,
                    user_name: member.name || member.mobile,
                    balance: 0
                };
            });

            expenses.forEach(expense => {
                const totalAmount = parseFloat(expense.amount);
                const paidBy = expense.paid_by;
                const splitBetween = expense.split_between;

                // Payer paid the full amount
                balances[paidBy].balance += totalAmount;

                // Distribute among split participants
                splitBetween.forEach(split => {
                    const shareAmount = parseFloat(split.amount);
                    balances[split.user_id].balance -= shareAmount;
                });
            });

            const balanceArray = Object.values(balances);

            // Simplify balances
            const settlements = simplifyBalances(balanceArray);

            res.json({ settlements, balances: balanceArray });
        } else {
            res.json({ settlements: [], balances: [] });
        }
    } catch (error) {
        console.error('Get settlements error:', error);
        res.status(500).json({ error: 'Failed to get settlements' });
    }
};

// Mark settlement as paid
export const markSettlementPaid = async (req, res) => {
    try {
        const { group_id, from_user, to_user, amount } = req.body;

        if (!group_id || !from_user || !to_user || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (supabase) {
            const { data: settlement, error } = await supabase
                .from('settlements')
                .insert({
                    group_id,
                    from_user,
                    to_user,
                    amount: parseFloat(amount),
                    status: 'paid',
                    paid_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            res.status(201).json({ success: true, settlement });
        } else {
            res.status(201).json({
                success: true,
                settlement: { group_id, from_user, to_user, amount, status: 'paid' }
            });
        }
    } catch (error) {
        console.error('Mark settlement paid error:', error);
        res.status(500).json({ error: 'Failed to mark settlement as paid' });
    }
};

// Get all settlements (across all groups)
export const getAllSettlements = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (supabase) {
            // Get all groups user is part of
            const { data: groupMembers } = await supabase
                .from('group_members')
                .select('group_id')
                .eq('user_id', userId);

            const groupIds = groupMembers.map(gm => gm.group_id);

            if (groupIds.length === 0) {
                return res.json({ settlements: [] });
            }

            // Get settlements for all groups
            const allSettlements = [];

            for (const groupId of groupIds) {
                const { data: expenses } = await supabase
                    .from('expenses')
                    .select('*')
                    .eq('group_id', groupId);

                const { data: memberRecords } = await supabase
                    .from('group_members')
                    .select('user_id, users (id, name, mobile)')
                    .eq('group_id', groupId);

                const members = memberRecords.map(m => m.users);

                // Calculate balances
                const balances = {};
                members.forEach(member => {
                    balances[member.id] = {
                        user_id: member.id,
                        user_name: member.name || member.mobile,
                        balance: 0
                    };
                });

                expenses.forEach(expense => {
                    const totalAmount = parseFloat(expense.amount);
                    const paidBy = expense.paid_by;
                    const splitBetween = expense.split_between;

                    balances[paidBy].balance += totalAmount;

                    splitBetween.forEach(split => {
                        const shareAmount = parseFloat(split.amount);
                        balances[split.user_id].balance -= shareAmount;
                    });
                });

                const balanceArray = Object.values(balances);
                const settlements = simplifyBalances(balanceArray);

                // Get group name
                const { data: group } = await supabase
                    .from('groups')
                    .select('name')
                    .eq('id', groupId)
                    .single();

                settlements.forEach(s => {
                    allSettlements.push({
                        ...s,
                        group_id: groupId,
                        group_name: group.name
                    });
                });
            }

            res.json({ settlements: allSettlements });
        } else {
            res.json({ settlements: [] });
        }
    } catch (error) {
        console.error('Get all settlements error:', error);
        res.status(500).json({ error: 'Failed to get settlements' });
    }
};
