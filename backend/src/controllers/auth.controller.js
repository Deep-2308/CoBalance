import jwt from 'jsonwebtoken';
import { randomUUID, randomBytes, createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import supabase from '../utils/supabase.js';

// Detect if identifier is email or mobile
const detectIdentifierType = (identifier) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\+?[1-9]\d{1,14}$/;
    
    if (emailRegex.test(identifier)) {
        return 'email';
    } else if (mobileRegex.test(identifier.replace(/\s/g, ''))) {
        return 'mobile';
    }
    return null;
};

// Validate identifier
const validateIdentifier = (identifier) => {
    const type = detectIdentifierType(identifier);
    if (!type) {
        return { valid: false, error: 'Please enter a valid email or mobile number' };
    }
    return { valid: true, type, identifier: identifier.replace(/\s/g, '') };
};

// Check if user exists by identifier
const findUserByIdentifier = async (identifier, type) => {
    if (!supabase) return null;
    
    const column = type === 'email' ? 'email' : 'mobile';
    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq(column, identifier)
        .single();
    
    return user;
};

// ============================================
// EMAIL/PASSWORD AUTH
// ============================================

// Signup with email + password
export const signupWithPassword = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validate inputs
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please enter a valid email address' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({ error: 'Name must be at least 2 characters' });
        }

        // Check if user already exists
        const existingUser = await findUserByIdentifier(email.trim(), 'email');
        if (existingUser) {
            return res.status(409).json({
                error: 'An account with this email already exists. Please login instead.',
                code: 'USER_EXISTS'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        let user;

        if (supabase) {
            const { data: newUser, error } = await supabase
                .from('users')
                .insert({
                    email: email.trim(),
                    name: name.trim(),
                    password_hash: passwordHash
                })
                .select()
                .single();

            if (error) {
                console.error('Create user error:', error);
                return res.status(500).json({
                    error: 'Failed to create account',
                    details: error.message || 'Unknown database error'
                });
            }

            user = newUser;
            console.log('✅ User created with password:', user.id);
        } else {
            // Mock mode
            user = {
                id: randomUUID(),
                email: email.trim(),
                name: name.trim(),
                mobile: null
            };
            console.log('📱 Mock user created with password (no database):', user);
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, mobile: user.mobile },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: user.id,
                email: user.email || null,
                mobile: user.mobile || null,
                name: user.name,
                userType: user.user_type || 'individual',
                language: user.language || 'en'
            }
        });
    } catch (error) {
        console.error('Signup with password error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
};

// Login with email + password (with account lockout + legacy detection)
export const loginWithPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate inputs
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const INTERNAL_DOMAIN = '@cobalance.app';

        // 1. Try to find user by email
        let user = await findUserByIdentifier(email.trim(), 'email');

        // 2. If not found, check if this is an internal phone-email (e.g. +919876543210@cobalance.app)
        //    Old OTP accounts may only have a 'mobile' column, not 'email'
        if (!user && email.endsWith(INTERNAL_DOMAIN)) {
            const phoneFromEmail = email.replace(INTERNAL_DOMAIN, '');
            user = await findUserByIdentifier(phoneFromEmail, 'mobile');
        }

        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // ── Account lockout check ──
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            const minutesLeft = Math.ceil(
                (new Date(user.locked_until) - new Date()) / 60000
            );
            return res.status(423).json({
                error: `Account temporarily locked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`,
                code: 'ACCOUNT_LOCKED',
                retryAfter: minutesLeft
            });
        }

        // ── Legacy user detection: no password set ──
        if (!user.password_hash) {
            // Generate a short-lived migration token (10 min)
            const migrationToken = jwt.sign(
                { userId: user.id, purpose: 'migration' },
                process.env.JWT_SECRET,
                { expiresIn: '10m' }
            );

            console.log(`🔄 Legacy user detected: ${user.mobile || user.email} — migration required`);

            return res.status(200).json({
                status: 'MIGRATION_REQUIRED',
                message: 'Password not set. Please set a password to continue.',
                migrationToken
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            // ── Track failed attempt ──
            if (supabase) {
                const newCount = (user.failed_login_attempts || 0) + 1;
                const updates = { failed_login_attempts: newCount };

                // Lock account after 5 failed attempts
                if (newCount >= 5) {
                    updates.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min
                    console.log(`🔒 Account locked for ${email} after ${newCount} failed attempts`);
                }

                await supabase
                    .from('users')
                    .update(updates)
                    .eq('id', user.id);
            }

            return res.status(401).json({
                error: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // ── Successful login — reset failed attempts ──
        if (supabase && (user.failed_login_attempts > 0 || user.locked_until)) {
            await supabase
                .from('users')
                .update({ failed_login_attempts: 0, locked_until: null })
                .eq('id', user.id);
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, mobile: user.mobile },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                mobile: user.mobile,
                name: user.name,
                userType: user.user_type,
                language: user.language
            }
        });
    } catch (error) {
        console.error('Login with password error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
};

// ============================================
// PASSWORD RECOVERY
// ============================================

// Forgot password — generate reset token
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Always return success to prevent email enumeration
        const successResponse = {
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.'
        };

        // Find user (don't reveal if email exists)
        const user = await findUserByIdentifier(email.trim(), 'email');
        if (!user) {
            return res.json(successResponse);
        }

        // Generate crypto-random reset token
        const rawToken = randomBytes(32).toString('hex');
        const hashedToken = createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store hashed token in DB
        if (supabase) {
            await supabase
                .from('users')
                .update({
                    password_reset_token: hashedToken,
                    password_reset_expires: expiresAt.toISOString()
                })
                .eq('id', user.id);
        }

        // Build reset URL (frontend will read the token from URL)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/auth/reset-password?token=${rawToken}&email=${encodeURIComponent(email.trim())}`;

        // TODO: Send email with resetUrl via SendGrid/Resend/etc.
        console.log('========================================');
        console.log('🔑 PASSWORD RESET LINK');
        console.log(`   Email: ${email}`);
        console.log(`   URL:   ${resetUrl}`);
        console.log(`   Expires: ${expiresAt.toISOString()}`);
        console.log('========================================');

        res.json(successResponse);
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process password reset' });
    }
};

// Reset password — validate token and set new password
export const resetPassword = async (req, res) => {
    try {
        const { token, email, newPassword } = req.body;

        if (!token || !email || !newPassword) {
            return res.status(400).json({ error: 'Token, email, and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Hash the incoming token to compare with DB
        const hashedToken = createHash('sha256').update(token).digest('hex');

        // Find user with matching token
        const user = await findUserByIdentifier(email.trim(), 'email');
        if (!user) {
            return res.status(400).json({
                error: 'Invalid or expired reset link. Please request a new one.',
                code: 'INVALID_TOKEN'
            });
        }

        // Verify token matches and hasn't expired
        if (
            user.password_reset_token !== hashedToken ||
            !user.password_reset_expires ||
            new Date(user.password_reset_expires) < new Date()
        ) {
            return res.status(400).json({
                error: 'Invalid or expired reset link. Please request a new one.',
                code: 'INVALID_TOKEN'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset token + unlock account
        if (supabase) {
            await supabase
                .from('users')
                .update({
                    password_hash: passwordHash,
                    password_reset_token: null,
                    password_reset_expires: null,
                    failed_login_attempts: 0,
                    locked_until: null
                })
                .eq('id', user.id);
        }

        console.log(`✅ Password reset successful for ${email}`);

        res.json({
            success: true,
            message: 'Password has been reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

// ============================================
// PROFILE & USER MANAGEMENT
// ============================================

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { name, language, userType } = req.body;
        const userId = req.user.userId;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        if (supabase) {
            const { data: updatedUser } = await supabase
                .from('users')
                .update({ 
                    name, 
                    language: language || 'en',
                    user_type: userType
                })
                .eq('id', userId)
                .select()
                .single();

            res.json({ 
                success: true, 
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    mobile: updatedUser.mobile,
                    name: updatedUser.name,
                    userType: updatedUser.user_type,
                    language: updatedUser.language
                }
            });
        } else {
            // Mock response
            res.json({
                success: true,
                user: { id: userId, name, language: language || 'en', userType }
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

            res.json({ 
                user: {
                    id: user.id,
                    email: user.email,
                    mobile: user.mobile,
                    name: user.name,
                    userType: user.user_type,
                    language: user.language
                }
            });
        } else {
            // Mock response
            res.json({
                user: {
                    id: userId,
                    email: req.user.email,
                    mobile: req.user.mobile,
                    name: 'Mock User',
                    userType: 'individual',
                    language: 'en'
                }
            });
        }
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
};

// ============================================
// LEGACY ACCOUNT MIGRATION
// ============================================

// Set password for legacy OTP users (migration token required)
export const setPassword = async (req, res) => {
    try {
        const { migrationToken, password, email } = req.body;

        // Validate inputs
        if (!migrationToken || !password) {
            return res.status(400).json({ error: 'Migration token and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Verify migration token
        let decoded;
        try {
            decoded = jwt.verify(migrationToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                error: 'Migration link expired. Please try logging in again.',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (decoded.purpose !== 'migration') {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Find user by ID from token
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.userId)
            .single();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Only allow if password is not already set (one-time use)
        if (user.password_hash) {
            return res.status(409).json({
                error: 'Password already set. Please login normally.',
                code: 'ALREADY_MIGRATED'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Build update object
        const updates = { password_hash: passwordHash };

        // Add email if provided (for password recovery later)
        if (email && email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                return res.status(400).json({ error: 'Please enter a valid email address' });
            }

            // Check if email is taken
            const existingEmail = await findUserByIdentifier(email.trim(), 'email');
            if (existingEmail && existingEmail.id !== user.id) {
                return res.status(409).json({
                    error: 'This email is already used by another account.',
                    code: 'EMAIL_TAKEN'
                });
            }

            updates.email = email.trim();
        }

        // Apply update
        await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id);

        console.log(`✅ Legacy account migrated: ${user.mobile} → password set, email=${updates.email || 'not added'}`);

        // Auto-login: generate JWT
        const token = jwt.sign(
            { userId: user.id, email: updates.email || user.email, mobile: user.mobile },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: 'Password set successfully!',
            token,
            user: {
                id: user.id,
                email: updates.email || user.email || null,
                mobile: user.mobile,
                name: user.name,
                userType: user.user_type || 'individual',
                language: user.language || 'en'
            }
        });
    } catch (error) {
        console.error('Set password error:', error);
        res.status(500).json({ error: 'Failed to set password' });
    }
};
