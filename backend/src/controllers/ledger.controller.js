import supabase from '../utils/supabase.js';

// Create contact
export const createContact = async (req, res) => {
    try {
        const { name, type } = req.body;
        const userId = req.user.userId;

        if (!name) {
            return res.status(400).json({ error: 'Contact name required' });
        }

        if (supabase) {
            const { data: contact, error } = await supabase
                .from('contacts')
                .insert({ user_id: userId, name, type: type || 'other' })
                .select()
                .single();

            if (error) throw error;
            res.status(201).json({ success: true, contact });
        } else {
            // Mock response
            res.status(201).json({
                success: true,
                contact: { id: 'mock-contact-id', user_id: userId, name, type: type || 'other' }
            });
        }
    } catch (error) {
        console.error('Create contact error:', error);
        res.status(500).json({ error: 'Failed to create contact' });
    }
};

// Get all contacts for user
export const getContacts = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (supabase) {
            // Get contacts with their balances
            const { data: contacts, error } = await supabase
                .from('contacts')
                .select(`
          *,
          transactions (amount, transaction_type)
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Calculate balance for each contact
            const contactsWithBalance = contacts.map(contact => {
                const balance = contact.transactions.reduce((acc, txn) => {
                    if (txn.transaction_type === 'credit') {
                        return acc + parseFloat(txn.amount);
                    } else {
                        return acc - parseFloat(txn.amount);
                    }
                }, 0);

                return {
                    id: contact.id,
                    name: contact.name,
                    type: contact.type,
                    balance: balance.toFixed(2),
                    transactionCount: contact.transactions.length,
                    created_at: contact.created_at
                };
            });

            res.json({ contacts: contactsWithBalance });
        } else {
            // Mock response
            res.json({ contacts: [] });
        }
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ error: 'Failed to get contacts' });
    }
};

// Get single contact with transactions
export const getContactDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (supabase) {
            const { data: contact, error: contactError } = await supabase
                .from('contacts')
                .select('*')
                .eq('id', id)
                .eq('user_id', userId)
                .single();

            if (contactError) throw contactError;

            const { data: transactions, error: txnError } = await supabase
                .from('transactions')
                .select('*')
                .eq('contact_id', id)
                .order('date', { ascending: false });

            if (txnError) throw txnError;

            // Calculate running balance
            let runningBalance = 0;
            const transactionsWithBalance = transactions.reverse().map(txn => {
                if (txn.transaction_type === 'credit') {
                    runningBalance += parseFloat(txn.amount);
                } else {
                    runningBalance -= parseFloat(txn.amount);
                }
                return { ...txn, running_balance: runningBalance.toFixed(2) };
            }).reverse();

            res.json({
                contact,
                transactions: transactionsWithBalance,
                currentBalance: runningBalance.toFixed(2)
            });
        } else {
            // Mock response
            res.json({
                contact: { id, name: 'Mock Contact', type: 'other' },
                transactions: [],
                currentBalance: '0.00'
            });
        }
    } catch (error) {
        console.error('Get contact detail error:', error);
        res.status(500).json({ error: 'Failed to get contact details' });
    }
};

// Update contact
export const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type } = req.body;
        const userId = req.user.userId;

        if (supabase) {
            const { data: contact, error } = await supabase
                .from('contacts')
                .update({ name, type })
                .eq('id', id)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            res.json({ success: true, contact });
        } else {
            res.json({ success: true, contact: { id, name, type } });
        }
    } catch (error) {
        console.error('Update contact error:', error);
        res.status(500).json({ error: 'Failed to update contact' });
    }
};

// Delete contact
export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (supabase) {
            const { error } = await supabase
                .from('contacts')
                .delete()
                .eq('id', id)
                .eq('user_id', userId);

            if (error) throw error;
            res.json({ success: true, message: 'Contact deleted' });
        } else {
            res.json({ success: true, message: 'Contact deleted' });
        }
    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
};

// Add transaction
export const addTransaction = async (req, res) => {
    try {
        const { contact_id, amount, transaction_type, note, date } = req.body;

        if (!contact_id || !amount || !transaction_type) {
            return res.status(400).json({ error: 'Contact, amount, and type required' });
        }

        if (!['credit', 'debit'].includes(transaction_type)) {
            return res.status(400).json({ error: 'Type must be credit or debit' });
        }

        if (parseFloat(amount) <= 0) {
            return res.status(400).json({ error: 'Amount must be positive' });
        }

        if (supabase) {
            const { data: transaction, error } = await supabase
                .from('transactions')
                .insert({
                    contact_id,
                    amount: parseFloat(amount),
                    transaction_type,
                    note,
                    date: date || new Date().toISOString().split('T')[0]
                })
                .select()
                .single();

            if (error) throw error;
            res.status(201).json({ success: true, transaction });
        } else {
            res.status(201).json({
                success: true,
                transaction: { id: 'mock-txn-id', contact_id, amount, transaction_type, note, date }
            });
        }
    } catch (error) {
        console.error('Add transaction error:', error);
        res.status(500).json({ error: 'Failed to add transaction' });
    }
};

// Get ledger summary
export const getLedgerSummary = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (supabase) {
            // Get all contacts with transactions
            const { data: contacts, error } = await supabase
                .from('contacts')
                .select(`
          id,
          name,
          transactions (amount, transaction_type)
        `)
                .eq('user_id', userId);

            if (error) throw error;

            let totalYouGet = 0;
            let totalYouOwe = 0;

            contacts.forEach(contact => {
                const balance = contact.transactions.reduce((acc, txn) => {
                    if (txn.transaction_type === 'credit') {
                        return acc + parseFloat(txn.amount);
                    } else {
                        return acc - parseFloat(txn.amount);
                    }
                }, 0);

                if (balance > 0) {
                    totalYouGet += balance;
                } else if (balance < 0) {
                    totalYouOwe += Math.abs(balance);
                }
            });

            res.json({
                totalYouGet: totalYouGet.toFixed(2),
                totalYouOwe: totalYouOwe.toFixed(2),
                netBalance: (totalYouGet - totalYouOwe).toFixed(2)
            });
        } else {
            res.json({
                totalYouGet: '0.00',
                totalYouOwe: '0.00',
                netBalance: '0.00'
            });
        }
    } catch (error) {
        console.error('Get ledger summary error:', error);
        res.status(500).json({ error: 'Failed to get ledger summary' });
    }
};
