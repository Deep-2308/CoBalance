import supabase from '../utils/supabase.js';

// Create group
export const createGroup = async (req, res) => {
    try {
        const { name, members } = req.body; // members: array of user IDs
        const userId = req.user.userId;

        if (!name) {
            return res.status(400).json({ error: 'Group name required' });
        }

        if (supabase) {
            // Create group
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .insert({ name, created_by: userId })
                .select()
                .single();

            if (groupError) throw groupError;

            // Add creator as member
            const memberInserts = [{ group_id: group.id, user_id: userId }];

            // Add other members if provided
            if (members && Array.isArray(members)) {
                members.forEach(memberId => {
                    if (memberId !== userId) {
                        memberInserts.push({ group_id: group.id, user_id: memberId });
                    }
                });
            }

            const { error: membersError } = await supabase
                .from('group_members')
                .insert(memberInserts);

            if (membersError) throw membersError;

            res.status(201).json({ success: true, group });
        } else {
            res.status(201).json({
                success: true,
                group: { id: 'mock-group-id', name, created_by: userId }
            });
        }
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({ error: 'Failed to create group' });
    }
};

// Get all groups for user
export const getGroups = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (supabase) {
            // Get groups where user is a member
            const { data: groupMembers, error } = await supabase
                .from('group_members')
                .select(`
          group_id,
          groups (
            id,
            name,
            created_by,
            created_at
          )
        `)
                .eq('user_id', userId);

            if (error) throw error;

            const groups = groupMembers.map(gm => gm.groups);

            // Get member count for each group
            const groupsWithCounts = await Promise.all(
                groups.map(async (group) => {
                    const { count } = await supabase
                        .from('group_members')
                        .select('*', { count: 'exact', head: true })
                        .eq('group_id', group.id);

                    return { ...group, memberCount: count || 0 };
                })
            );

            res.json({ groups: groupsWithCounts });
        } else {
            res.json({ groups: [] });
        }
    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({ error: 'Failed to get groups' });
    }
};

// Get group details
export const getGroupDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (supabase) {
            // Verify user is member
            const { data: membership } = await supabase
                .from('group_members')
                .select('*')
                .eq('group_id', id)
                .eq('user_id', userId)
                .single();

            if (!membership) {
                return res.status(403).json({ error: 'Not a member of this group' });
            }

            // Get group info
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .select('*')
                .eq('id', id)
                .single();

            if (groupError) throw groupError;

            // Get members
            const { data: memberRecords, error: membersError } = await supabase
                .from('group_members')
                .select(`
          user_id,
          users (id, name, mobile)
        `)
                .eq('group_id', id);

            if (membersError) throw membersError;

            const members = memberRecords.map(m => m.users);

            // Get expenses
            const { data: expenses, error: expensesError } = await supabase
                .from('expenses')
                .select(`
          *,
          payer:paid_by (id, name, mobile)
        `)
                .eq('group_id', id)
                .order('date', { ascending: false });

            if (expensesError) throw expensesError;

            res.json({ group, members, expenses });
        } else {
            res.json({
                group: { id, name: 'Mock Group' },
                members: [],
                expenses: []
            });
        }
    } catch (error) {
        console.error('Get group detail error:', error);
        res.status(500).json({ error: 'Failed to get group details' });
    }
};

// Update group
export const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userId = req.user.userId;

        if (supabase) {
            // Only creator can update
            const { data: group, error } = await supabase
                .from('groups')
                .update({ name })
                .eq('id', id)
                .eq('created_by', userId)
                .select()
                .single();

            if (error) throw error;
            res.json({ success: true, group });
        } else {
            res.json({ success: true, group: { id, name } });
        }
    } catch (error) {
        console.error('Update group error:', error);
        res.status(500).json({ error: 'Failed to update group' });
    }
};

// Delete group
export const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (supabase) {
            const { error } = await supabase
                .from('groups')
                .delete()
                .eq('id', id)
                .eq('created_by', userId);

            if (error) throw error;
            res.json({ success: true, message: 'Group deleted' });
        } else {
            res.json({ success: true, message: 'Group deleted' });
        }
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({ error: 'Failed to delete group' });
    }
};

// Add member to group (with Shadow/Ghost User support + SMS Invites)
export const addMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, mobile, name } = req.body; // Added optional 'name' parameter
        const userId = req.user.userId;

        if (!user_id && !mobile) {
            return res.status(400).json({ error: 'User ID or mobile number required' });
        }

        if (supabase) {
            // Verify requester is a member or creator
            const { data: membership } = await supabase
                .from('group_members')
                .select('*')
                .eq('group_id', id)
                .eq('user_id', userId)
                .single();

            if (!membership) {
                return res.status(403).json({ error: 'Only group members can add others' });
            }

            // Get group info for SMS
            const { data: group } = await supabase
                .from('groups')
                .select('name')
                .eq('id', id)
                .single();

            // Get inviter info for SMS
            const { data: inviter } = await supabase
                .from('users')
                .select('name')
                .eq('id', userId)
                .single();

            let targetUserId = user_id;
            let isGhostUser = false;
            let shouldSendSMS = false;

            // If mobile provided, look up or create user
            if (mobile && !user_id) {
                const formattedMobile = mobile.startsWith('+91') ? mobile : `+91${mobile}`;
                
                // Try to find existing user
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('id, name, mobile')
                    .eq('mobile', formattedMobile)
                    .single();

                if (existingUser) {
                    // User already registered
                    targetUserId = existingUser.id;
                } else {
                    // CREATE SHADOW/GHOST USER
                    console.log(`Creating ghost user for mobile: ${formattedMobile}`);
                    
                    // Use provided name OR generate from last 4 digits
                    const last4Digits = formattedMobile.slice(-4);
                    const ghostName = name || `Friend ${last4Digits}`;

                    // Create new user account (ghost user)
                    const { data: newUser, error: createError } = await supabase
                        .from('users')
                        .insert({
                            mobile: formattedMobile,
                            name: ghostName,
                            language: 'en'
                            // Note: No password/auth - they're a "ghost" until they sign up
                        })
                        .select('id, name, mobile')
                        .single();

                    if (createError) {
                        console.error('Failed to create ghost user:', createError);
                        throw createError;
                    }

                    targetUserId = newUser.id;
                    isGhostUser = true;
                    shouldSendSMS = true;
                    
                    console.log(`✅ Ghost user created: ${newUser.name} (${newUser.mobile})`);
                }
            }

            // Check if already a member
            const { data: existingMember } = await supabase
                .from('group_members')
                .select('*')
                .eq('group_id', id)
                .eq('user_id', targetUserId)
                .single();

            if (existingMember) {
                return res.status(400).json({ error: 'User is already a member of this group' });
            }

            // Add member to group
            const { data: member, error } = await supabase
                .from('group_members')
                .insert({ group_id: id, user_id: targetUserId })
                .select(`
                    user_id,
                    users (id, name, mobile)
                `)
                .single();

            if (error) {
                throw error;
            }

            // Send SMS invitation in background (non-blocking)
            if (shouldSendSMS && member.users.mobile) {
                // Fire and forget - don't await
                import('../services/sms.service.js').then(({ sendGroupInviteSMS }) => {
                    sendGroupInviteSMS(
                        member.users.mobile,
                        group?.name || 'a group',
                        inviter?.name || 'Someone'
                    ).catch(err => {
                        console.error('SMS send failed (non-critical):', err);
                    });
                });
            }

            // Return success immediately (SMS sent in background)
            res.status(201).json({ 
                success: true, 
                member: member.users,
                is_ghost_user: isGhostUser,
                sms_sent: shouldSendSMS,
                message: isGhostUser 
                    ? 'Friend added! We\'ll send them an invite to join CoBalance.' 
                    : 'Member added successfully'
            });
        } else {
            res.status(201).json({ success: true, member: { group_id: id, user_id: targetUserId } });
        }
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ error: 'Failed to add member' });
    }
};

// Remove member from group
export const removeMember = async (req, res) => {
    try {
        const { id, userId } = req.params;

        if (supabase) {
            const { error } = await supabase
                .from('group_members')
                .delete()
                .eq('group_id', id)
                .eq('user_id', userId);

            if (error) throw error;
            res.json({ success: true, message: 'Member removed' });
        } else {
            res.json({ success: true, message: 'Member removed' });
        }
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ error: 'Failed to remove member' });
    }
};

// Add expense
export const addExpense = async (req, res) => {
    try {
        const { group_id, description, amount, paid_by, split_between, date } = req.body;

        if (!group_id || !description || !amount || !paid_by || !split_between) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (parseFloat(amount) <= 0) {
            return res.status(400).json({ error: 'Amount must be positive' });
        }

        if (!Array.isArray(split_between) || split_between.length === 0) {
            return res.status(400).json({ error: 'Split between must be a non-empty array' });
        }

        if (supabase) {
            const { data: expense, error } = await supabase
                .from('expenses')
                .insert({
                    group_id,
                    description,
                    amount: parseFloat(amount),
                    paid_by,
                    split_between,
                    date: date || new Date().toISOString().split('T')[0]
                })
                .select()
                .single();

            if (error) throw error;
            res.status(201).json({ success: true, expense });
        } else {
            res.status(201).json({
                success: true,
                expense: { id: 'mock-expense-id', group_id, description, amount, paid_by, split_between }
            });
        }
    } catch (error) {
        console.error('Add expense error:', error);
        res.status(500).json({ error: 'Failed to add expense' });
    }
};

// Get group balances
export const getGroupBalances = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (supabase) {
            // Verify membership
            const { data: membership } = await supabase
                .from('group_members')
                .select('*')
                .eq('group_id', id)
                .eq('user_id', userId)
                .single();

            if (!membership) {
                return res.status(403).json({ error: 'Not a member of this group' });
            }

            // Get all expenses
            const { data: expenses, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('group_id', id);

            if (error) throw error;

            // Get all members
            const { data: memberRecords } = await supabase
                .from('group_members')
                .select('user_id, users (id, name, mobile)')
                .eq('group_id', id);

            const members = memberRecords.map(m => m.users);

            // Calculate balances
            const balances = {};
            members.forEach(member => {
                balances[member.id] = { user: member, balance: 0 };
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

            const balanceArray = Object.values(balances).map(b => ({
                user_id: b.user.id,
                user_name: b.user.name || b.user.mobile,
                balance: b.balance.toFixed(2)
            }));

            res.json({ balances: balanceArray });
        } else {
            res.json({ balances: [] });
        }
    } catch (error) {
        console.error('Get group balances error:', error);
        res.status(500).json({ error: 'Failed to get group balances' });
    }
};
