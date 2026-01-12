import supabase from '../utils/supabase.js';

// Unified search across contacts, groups, and transactions
export const search = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.json({ contacts: [], groups: [], transactions: [] });
        }

        const searchTerm = q.trim().toLowerCase();
        const results = { contacts: [], groups: [], transactions: [] };

        if (supabase) {
            // Search contacts by name
            const { data: contacts, error: contactsError } = await supabase
                .from('contacts')
                .select('id, name, type')
                .eq('user_id', userId)
                .ilike('name', `%${searchTerm}%`)
                .limit(5);

            if (!contactsError && contacts) {
                results.contacts = contacts;
            }

            // Search groups by name (where user is a member)
            const { data: groupMembers, error: groupsError } = await supabase
                .from('group_members')
                .select(`
                    group_id,
                    groups (id, name)
                `)
                .eq('user_id', userId);

            if (!groupsError && groupMembers) {
                results.groups = groupMembers
                    .map(gm => gm.groups)
                    .filter(g => g && g.name.toLowerCase().includes(searchTerm))
                    .slice(0, 5);
            }

            // Search transactions by note (for user's contacts only)
            const { data: userContacts } = await supabase
                .from('contacts')
                .select('id')
                .eq('user_id', userId);

            if (userContacts && userContacts.length > 0) {
                const contactIds = userContacts.map(c => c.id);
                const { data: transactions, error: txnError } = await supabase
                    .from('transactions')
                    .select(`
                        id, amount, transaction_type, note, date,
                        contact:contact_id (id, name)
                    `)
                    .in('contact_id', contactIds)
                    .ilike('note', `%${searchTerm}%`)
                    .order('date', { ascending: false })
                    .limit(5);

                if (!txnError && transactions) {
                    results.transactions = transactions;
                }
            }

            res.json(results);
        } else {
            res.json(results);
        }
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
};
