import jwt from 'jsonwebtoken';
import supabase from '../utils/supabase.js';

// Mock OTP storage for email verification
const emailOtpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Get security overview
export const getSecurityOverview = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        if (process.env.OTP_PROVIDER === 'mock' || !supabase) {
            return res.json({
                success: true,
                security: {
                    primaryLoginMethod: 'mobile',
                    mobile: '+919876543210',
                    email: 'test@example.com',
                    emailVerified: false,
                    deletionRequested: false
                }
            });
        }
        
        const { data: user, error } = await supabase
            .from('users')
            .select('mobile, email, email_verified, deletion_requested_at')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        res.json({
            success: true,
            security: {
                primaryLoginMethod: user.mobile ? 'mobile' : 'email',
                mobile: user.mobile,
                email: user.email,
                emailVerified: user.email_verified || false,
                deletionRequested: !!user.deletion_requested_at
            }
        });
    } catch (error) {
        console.error('Get security overview error:', error);
        res.status(500).json({ error: 'Failed to get security info' });
    }
};

// Send OTP to verify new email
export const sendEmailVerificationOTP = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { email } = req.body;
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Valid email required' });
        }
        
        const cleanEmail = email.toLowerCase().trim();
        
        // Check if email is already in use by another user
        if (supabase && process.env.OTP_PROVIDER !== 'mock') {
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', cleanEmail)
                .neq('id', userId)
                .single();
            
            if (existingUser) {
                return res.status(409).json({ 
                    error: 'This email is already in use by another account',
                    code: 'EMAIL_IN_USE'
                });
            }
        }
        
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        // Store OTP
        emailOtpStore.set(`email:${userId}:${cleanEmail}`, { otp, expiresAt });
        
        // TODO: Send actual email OTP
        console.log(`📧 Email verification OTP for ${cleanEmail}: ${otp}`);
        
        res.json({
            success: true,
            message: 'Verification code sent to email',
            _dev_otp: process.env.OTP_PROVIDER === 'mock' ? otp : undefined
        });
    } catch (error) {
        console.error('Send email OTP error:', error);
        res.status(500).json({ error: 'Failed to send verification code' });
    }
};

// Verify email OTP and update email
export const verifyEmailOTP = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP required' });
        }
        
        const cleanEmail = email.toLowerCase().trim();
        
        // Verify OTP
        const stored = emailOtpStore.get(`email:${userId}:${cleanEmail}`);
        if (!stored || stored.otp !== otp || new Date() > stored.expiresAt) {
            return res.status(401).json({ error: 'Invalid or expired verification code' });
        }
        
        // Clear OTP
        emailOtpStore.delete(`email:${userId}:${cleanEmail}`);
        
        if (process.env.OTP_PROVIDER === 'mock' || !supabase) {
            return res.json({
                success: true,
                message: 'Email verified and updated successfully',
                email: cleanEmail
            });
        }
        
        // Update email and mark as verified
        const { error } = await supabase
            .from('users')
            .update({ 
                email: cleanEmail, 
                email_verified: true,
                email_verification_sent_at: null
            })
            .eq('id', userId);
        
        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'This email is already in use' });
            }
            throw error;
        }
        
        res.json({
            success: true,
            message: 'Email verified and updated successfully',
            email: cleanEmail
        });
    } catch (error) {
        console.error('Verify email OTP error:', error);
        res.status(500).json({ error: 'Failed to verify email' });
    }
};

// Request account deletion
export const requestAccountDeletion = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { reason } = req.body;
        
        if (process.env.OTP_PROVIDER === 'mock' || !supabase) {
            return res.json({
                success: true,
                message: 'Account deletion requested. Your account will be deleted within 30 days.'
            });
        }
        
        // Mark account for deletion
        const { error: updateError } = await supabase
            .from('users')
            .update({
                deletion_requested_at: new Date().toISOString(),
                deletion_reason: reason || 'No reason provided'
            })
            .eq('id', userId);
        
        if (updateError) throw updateError;
        
        // Invalidate all sessions
        const { error: sessionError } = await supabase
            .from('user_sessions')
            .delete()
            .eq('user_id', userId);
        
        if (sessionError) console.error('Failed to clear sessions:', sessionError);
        
        res.json({
            success: true,
            message: 'Account deletion requested. Your account will be deleted within 30 days.'
        });
    } catch (error) {
        console.error('Request deletion error:', error);
        res.status(500).json({ error: 'Failed to request account deletion' });
    }
};

// Cancel account deletion request
export const cancelAccountDeletion = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        if (process.env.OTP_PROVIDER === 'mock' || !supabase) {
            return res.json({
                success: true,
                message: 'Account deletion request cancelled'
            });
        }
        
        const { error } = await supabase
            .from('users')
            .update({
                deletion_requested_at: null,
                deletion_reason: null
            })
            .eq('id', userId);
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Account deletion request cancelled'
        });
    } catch (error) {
        console.error('Cancel deletion error:', error);
        res.status(500).json({ error: 'Failed to cancel deletion request' });
    }
};
