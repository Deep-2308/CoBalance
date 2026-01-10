import jwt from 'jsonwebtoken';
import supabase from '../utils/supabase.js';

// Mock OTP storage (in-memory for development)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
export const sendOTP = async (req, res) => {
    try {
        const { mobile } = req.body;

        if (!mobile || !/^\+?[1-9]\d{1,14}$/.test(mobile)) {
            return res.status(400).json({ error: 'Valid mobile number required' });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // In production, send OTP via SMS provider
        if (process.env.OTP_PROVIDER === 'mock') {
            // Mock: Store in memory
            otpStore.set(mobile, { otp, expiresAt });
            console.log(`📱 Mock OTP for ${mobile}: ${otp}`);

            return res.json({
                success: true,
                message: 'OTP sent successfully',
                // ONLY in development mode
                _dev_otp: otp
            });
        }

        // Store in database
        if (supabase) {
            await supabase.from('otp_codes').insert({
                mobile,
                otp,
                expires_at: expiresAt.toISOString()
            });
        }

        // TODO: Integrate with Twilio/Firebase/Supabase Phone Auth
        console.log(`📱 OTP for ${mobile}: ${otp}`);

        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

// Verify OTP and login/register user
export const verifyOTP = async (req, res) => {
    try {
        const { mobile, otp } = req.body;

        if (!mobile || !otp) {
            return res.status(400).json({ error: 'Mobile and OTP required' });
        }

        let isValid = false;

        // Check mock store
        if (process.env.OTP_PROVIDER === 'mock') {
            const stored = otpStore.get(mobile);
            if (stored && stored.otp === otp && new Date() < stored.expiresAt) {
                isValid = true;
                otpStore.delete(mobile); // Use once
            }
        } else if (supabase) {
            // Check database
            const { data: otpRecord } = await supabase
                .from('otp_codes')
                .select('*')
                .eq('mobile', mobile)
                .eq('otp', otp)
                .eq('verified', false)
                .gt('expires_at', new Date().toISOString())
                .single();

            if (otpRecord) {
                isValid = true;
                // Mark as verified
                await supabase
                    .from('otp_codes')
                    .update({ verified: true })
                    .eq('id', otpRecord.id);
            }
        }

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }

        // Find or create user
        let user;

        if (supabase) {
            const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('mobile', mobile)
                .single();

            if (existingUser) {
                user = existingUser;
            } else {
                // Create new user
                const { data: newUser } = await supabase
                    .from('users')
                    .insert({ mobile })
                    .select()
                    .single();
                user = newUser;
            }
        } else {
            // Mock user for development
            user = {
                id: 'mock-user-id',
                mobile,
                name: null,
                language: 'en'
            };
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, mobile: user.mobile },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                mobile: user.mobile,
                name: user.name,
                language: user.language,
                isNewUser: !user.name
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { name, language } = req.body;
        const userId = req.user.userId;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        if (supabase) {
            const { data: updatedUser } = await supabase
                .from('users')
                .update({ name, language: language || 'en' })
                .eq('id', userId)
                .select()
                .single();

            res.json({ success: true, user: updatedUser });
        } else {
            // Mock response
            res.json({
                success: true,
                user: { id: userId, name, language: language || 'en' }
            });
        }
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Get current user
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (supabase) {
            const { data: user } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            res.json({ user });
        } else {
            // Mock response
            res.json({
                user: {
                    id: userId,
                    mobile: req.user.mobile,
                    name: 'Mock User',
                    language: 'en'
                }
            });
        }
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
};
