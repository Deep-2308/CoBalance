import supabase from '../utils/supabase.js';

// Generate WhatsApp reminder link (existing functionality)
export const generateReminder = async (req, res) => {
    try {
        const { name, mobile, amount } = req.body;

        if (!name || !mobile || !amount) {
            return res.status(400).json({ error: 'Name, mobile, and amount required' });
        }

        const message = encodeURIComponent(
            `Hi ${name}, this is a friendly reminder about the pending balance of ₹${amount}. Please settle when convenient. - CoBalance`
        );

        const whatsappLink = `https://wa.me/${mobile.replace(/[^0-9]/g, '')}?text=${message}`;

        res.json({ success: true, whatsappLink, message });
    } catch (error) {
        console.error('Generate reminder error:', error);
        res.status(500).json({ error: 'Failed to generate reminder' });
    }
};

// Log a reminder that was sent
export const logReminder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { 
            contactId, 
            groupId, 
            targetUserId, 
            recipientName, 
            recipientMobile, 
            amount, 
            message 
        } = req.body;

        if (!recipientName || !amount || !message) {
            return res.status(400).json({ error: 'Recipient name, amount, and message are required' });
        }

        if (supabase) {
            const { data: reminder, error } = await supabase
                .from('reminders')
                .insert({
                    user_id: userId,
                    contact_id: contactId || null,
                    group_id: groupId || null,
                    target_user_id: targetUserId || null,
                    recipient_name: recipientName,
                    recipient_mobile: recipientMobile || null,
                    amount: parseFloat(amount),
                    message
                })
                .select()
                .single();

            if (error) throw error;

            res.status(201).json({ success: true, reminder });
        } else {
            // Mock response
            res.status(201).json({
                success: true,
                reminder: {
                    id: 'mock-reminder-id',
                    user_id: userId,
                    contact_id: contactId,
                    group_id: groupId,
                    target_user_id: targetUserId,
                    recipient_name: recipientName,
                    recipient_mobile: recipientMobile,
                    amount: parseFloat(amount),
                    message,
                    sent_at: new Date().toISOString()
                }
            });
        }
    } catch (error) {
        console.error('Log reminder error:', error);
        res.status(500).json({ error: 'Failed to log reminder' });
    }
};

// Get reminder history for a contact
export const getContactReminders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { contactId } = req.params;

        if (supabase) {
            const { data: reminders, error } = await supabase
                .from('reminders')
                .select('*')
                .eq('user_id', userId)
                .eq('contact_id', contactId)
                .order('sent_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            res.json({ reminders });
        } else {
            // Mock response
            res.json({ reminders: [] });
        }
    } catch (error) {
        console.error('Get contact reminders error:', error);
        res.status(500).json({ error: 'Failed to get reminders' });
    }
};

// Get reminder history for a group member
export const getGroupMemberReminders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { groupId, targetUserId } = req.params;

        if (supabase) {
            const { data: reminders, error } = await supabase
                .from('reminders')
                .select('*')
                .eq('user_id', userId)
                .eq('group_id', groupId)
                .eq('target_user_id', targetUserId)
                .order('sent_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            res.json({ reminders });
        } else {
            // Mock response
            res.json({ reminders: [] });
        }
    } catch (error) {
        console.error('Get group member reminders error:', error);
        res.status(500).json({ error: 'Failed to get reminders' });
    }
};

// Get last reminder for a contact (quick summary)
export const getLastContactReminder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { contactId } = req.params;

        if (supabase) {
            const { data: reminder, error } = await supabase
                .from('reminders')
                .select('id, sent_at, amount')
                .eq('user_id', userId)
                .eq('contact_id', contactId)
                .order('sent_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;

            res.json({ lastReminder: reminder });
        } else {
            res.json({ lastReminder: null });
        }
    } catch (error) {
        console.error('Get last contact reminder error:', error);
        res.status(500).json({ error: 'Failed to get last reminder' });
    }
};
