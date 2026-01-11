import supabase from '../utils/supabase.js';

// Get user profile
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (process.env.OTP_PROVIDER === 'mock' || !supabase) {
            // Mock profile for development
            return res.json({
                success: true,
                profile: {
                    id: userId,
                    email: 'test@example.com',
                    mobile: '+919876543210',
                    name: 'Test User',
                    userType: 'individual',
                    language: 'en',
                    businessName: null,
                    businessCategory: null,
                    businessPhone: null,
                    whatsappReminderEnabled: true,
                    defaultReminderMessage: 'Hi, this is a friendly reminder about your pending balance. Please settle when convenient.'
                }
            });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            profile: {
                id: user.id,
                email: user.email,
                mobile: user.mobile,
                name: user.name,
                userType: user.user_type,
                language: user.language,
                businessName: user.business_name,
                businessCategory: user.business_category,
                businessPhone: user.business_phone,
                whatsappReminderEnabled: user.whatsapp_reminder_enabled ?? true,
                defaultReminderMessage: user.default_reminder_message || 'Hi, this is a friendly reminder about your pending balance. Please settle when convenient.',
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            name,
            email,
            language,
            userType,
            businessName,
            businessCategory,
            businessPhone,
            whatsappReminderEnabled,
            defaultReminderMessage
        } = req.body;

        // Validate required fields
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'Name is required (minimum 2 characters)' });
        }

        // Validate email format if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Build update object
        const updateData = {
            name: name.trim(),
            language: language || 'en',
            user_type: userType || 'individual',
            whatsapp_reminder_enabled: whatsappReminderEnabled ?? true,
            default_reminder_message: defaultReminderMessage || null
        };

        // Add email only if provided
        if (email) {
            updateData.email = email.toLowerCase().trim();
        }

        // Add business fields only if user is business type
        if (userType === 'business') {
            updateData.business_name = businessName?.trim() || null;
            updateData.business_category = businessCategory || null;
            updateData.business_phone = businessPhone?.trim() || null;
        } else {
            // Clear business fields if switching to individual
            updateData.business_name = null;
            updateData.business_category = null;
            updateData.business_phone = null;
        }

        if (process.env.OTP_PROVIDER === 'mock' || !supabase) {
            // Mock update for development
            return res.json({
                success: true,
                message: 'Profile updated successfully',
                profile: {
                    id: userId,
                    email: email || 'test@example.com',
                    mobile: '+919876543210',
                    name: name.trim(),
                    userType: userType || 'individual',
                    language: language || 'en',
                    businessName: userType === 'business' ? businessName : null,
                    businessCategory: userType === 'business' ? businessCategory : null,
                    businessPhone: userType === 'business' ? businessPhone : null,
                    whatsappReminderEnabled: whatsappReminderEnabled ?? true,
                    defaultReminderMessage: defaultReminderMessage || 'Hi, this is a friendly reminder...'
                }
            });
        }

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Update profile error:', error);
            
            // Handle unique constraint violation for email
            if (error.code === '23505' && error.message.includes('email')) {
                return res.status(409).json({ error: 'This email is already in use' });
            }
            
            return res.status(500).json({ error: 'Failed to update profile' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile: {
                id: updatedUser.id,
                email: updatedUser.email,
                mobile: updatedUser.mobile,
                name: updatedUser.name,
                userType: updatedUser.user_type,
                language: updatedUser.language,
                businessName: updatedUser.business_name,
                businessCategory: updatedUser.business_category,
                businessPhone: updatedUser.business_phone,
                whatsappReminderEnabled: updatedUser.whatsapp_reminder_enabled,
                defaultReminderMessage: updatedUser.default_reminder_message
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
