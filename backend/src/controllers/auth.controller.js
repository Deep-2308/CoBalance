import jwt from 'jsonwebtoken';
import supabase from '../utils/supabase.js';

// Mock OTP storage (in-memory for development)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

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
// LOGIN FLOW
// ============================================

// Send OTP for LOGIN (user must exist)
export const sendLoginOTP = async (req, res) => {
    try {
        const { identifier } = req.body;
        
        const validation = validateIdentifier(identifier);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }
        
        const { type, identifier: cleanIdentifier } = validation;
        
        // Check if user exists
        const existingUser = await findUserByIdentifier(cleanIdentifier, type);
        if (!existingUser && supabase) {
            return res.status(404).json({ 
                error: 'Account not found. Please create an account.',
                code: 'USER_NOT_FOUND'
            });
        }
        
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        
        // Store OTP
        if (process.env.OTP_PROVIDER === 'mock') {
            otpStore.set(`login:${cleanIdentifier}`, { otp, expiresAt, type });
            console.log(`📱 Mock LOGIN OTP for ${cleanIdentifier}: ${otp}`);
            
            return res.json({
                success: true,
                message: 'OTP sent successfully',
                identifierType: type,
                _dev_otp: otp
            });
        }
        
        // Store in database
        if (supabase) {
            await supabase.from('otp_codes').insert({
                identifier: cleanIdentifier,
                identifier_type: type,
                otp,
                purpose: 'login',
                expires_at: expiresAt.toISOString()
            });
        }
        
        // TODO: Send actual OTP via email/SMS provider
        console.log(`📱 LOGIN OTP for ${cleanIdentifier}: ${otp}`);
        
        res.json({ 
            success: true, 
            message: 'OTP sent successfully',
            identifierType: type
        });
    } catch (error) {
        console.error('Send login OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

// Verify OTP for LOGIN
export const verifyLoginOTP = async (req, res) => {
    try {
        const { identifier, otp } = req.body;
        
        const validation = validateIdentifier(identifier);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }
        
        const { type, identifier: cleanIdentifier } = validation;
        
        if (!otp || otp.length !== 6) {
            return res.status(400).json({ error: 'Valid 6-digit OTP required' });
        }
        
        let isValid = false;
        
        // Check mock store
        if (process.env.OTP_PROVIDER === 'mock') {
            const stored = otpStore.get(`login:${cleanIdentifier}`);
            if (stored && stored.otp === otp && new Date() < stored.expiresAt) {
                isValid = true;
                otpStore.delete(`login:${cleanIdentifier}`);
            }
        } else if (supabase) {
            // Check database
            const { data: otpRecord } = await supabase
                .from('otp_codes')
                .select('*')
                .eq('identifier', cleanIdentifier)
                .eq('otp', otp)
                .eq('purpose', 'login')
                .eq('verified', false)
                .gt('expires_at', new Date().toISOString())
                .single();
            
            if (otpRecord) {
                isValid = true;
                await supabase
                    .from('otp_codes')
                    .update({ verified: true })
                    .eq('id', otpRecord.id);
            }
        }
        
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }
        
        // Get user
        const user = await findUserByIdentifier(cleanIdentifier, type);
        if (!user) {
            return res.status(404).json({ 
                error: 'Account not found. Please create an account.',
                code: 'USER_NOT_FOUND'
            });
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
        console.error('Verify login OTP error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
};

// ============================================
// REGISTER FLOW
// ============================================

// Send OTP for REGISTER (user must NOT exist)
export const sendRegisterOTP = async (req, res) => {
    try {
        const { identifier } = req.body;
        
        const validation = validateIdentifier(identifier);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }
        
        const { type, identifier: cleanIdentifier } = validation;
        
        // Check if user already exists
        const existingUser = await findUserByIdentifier(cleanIdentifier, type);
        if (existingUser) {
            return res.status(409).json({ 
                error: 'Account already exists. Please login instead.',
                code: 'USER_EXISTS'
            });
        }
        
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        
        // Store OTP
        if (process.env.OTP_PROVIDER === 'mock') {
            otpStore.set(`register:${cleanIdentifier}`, { otp, expiresAt, type });
            console.log(`📱 Mock REGISTER OTP for ${cleanIdentifier}: ${otp}`);
            
            return res.json({
                success: true,
                message: 'OTP sent successfully',
                identifierType: type,
                _dev_otp: otp
            });
        }
        
        // Store in database
        if (supabase) {
            await supabase.from('otp_codes').insert({
                identifier: cleanIdentifier,
                identifier_type: type,
                otp,
                purpose: 'register',
                expires_at: expiresAt.toISOString()
            });
        }
        
        // TODO: Send actual OTP via email/SMS provider
        console.log(`📱 REGISTER OTP for ${cleanIdentifier}: ${otp}`);
        
        res.json({ 
            success: true, 
            message: 'OTP sent successfully',
            identifierType: type
        });
    } catch (error) {
        console.error('Send register OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

// Verify OTP for REGISTER (returns temp token for registration completion)
export const verifyRegisterOTP = async (req, res) => {
    try {
        const { identifier, otp } = req.body;
        
        const validation = validateIdentifier(identifier);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }
        
        const { type, identifier: cleanIdentifier } = validation;
        
        if (!otp || otp.length !== 6) {
            return res.status(400).json({ error: 'Valid 6-digit OTP required' });
        }
        
        let isValid = false;
        
        // Check mock store
        if (process.env.OTP_PROVIDER === 'mock') {
            const stored = otpStore.get(`register:${cleanIdentifier}`);
            if (stored && stored.otp === otp && new Date() < stored.expiresAt) {
                isValid = true;
                otpStore.delete(`register:${cleanIdentifier}`);
            }
        } else if (supabase) {
            // Check database
            const { data: otpRecord } = await supabase
                .from('otp_codes')
                .select('*')
                .eq('identifier', cleanIdentifier)
                .eq('otp', otp)
                .eq('purpose', 'register')
                .eq('verified', false)
                .gt('expires_at', new Date().toISOString())
                .single();
            
            if (otpRecord) {
                isValid = true;
                await supabase
                    .from('otp_codes')
                    .update({ verified: true })
                    .eq('id', otpRecord.id);
            }
        }
        
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }
        
        // Double-check user doesn't exist
        const existingUser = await findUserByIdentifier(cleanIdentifier, type);
        if (existingUser) {
            return res.status(409).json({ 
                error: 'Account already exists. Please login instead.',
                code: 'USER_EXISTS'
            });
        }
        
        // Generate temporary registration token (short-lived, 10 minutes)
        const tempToken = jwt.sign(
            { 
                identifier: cleanIdentifier, 
                identifierType: type,
                purpose: 'registration'
            },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );
        
        res.json({
            success: true,
            message: 'OTP verified. Please complete registration.',
            tempToken,
            identifier: cleanIdentifier,
            identifierType: type
        });
    } catch (error) {
        console.error('Verify register OTP error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
};

// Complete registration with user details
export const completeRegistration = async (req, res) => {
    try {
        const { tempToken, name, userType, language, termsAccepted } = req.body;
        
        if (!tempToken) {
            return res.status(400).json({ error: 'Registration token required' });
        }
        
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'Name is required (minimum 2 characters)' });
        }
        
        if (!termsAccepted) {
            return res.status(400).json({ error: 'You must accept the Terms & Privacy Policy' });
        }
        
        // Verify temp token
        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ 
                error: 'Registration session expired. Please start over.',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        if (decoded.purpose !== 'registration') {
            return res.status(401).json({ error: 'Invalid registration token' });
        }
        
        const { identifier, identifierType } = decoded;
        
        // Create user
        let user;
        
        // Use mock mode if OTP_PROVIDER is mock OR if supabase is not configured
        if (process.env.OTP_PROVIDER === 'mock' || !supabase) {
            // Mock user for development
            user = {
                id: 'mock-user-' + Date.now(),
                email: identifierType === 'email' ? identifier : null,
                mobile: identifierType === 'mobile' ? identifier : null,
                name: name.trim(),
                user_type: userType || 'individual',
                language: language || 'en',
                terms_accepted_at: new Date().toISOString()
            };
            console.log('📱 Mock user created:', user);
        } else {
            // Double-check user doesn't exist
            const existingUser = await findUserByIdentifier(identifier, identifierType);
            if (existingUser) {
                return res.status(409).json({ 
                    error: 'Account already exists. Please login instead.',
                    code: 'USER_EXISTS'
                });
            }
            
            const userData = {
                [identifierType]: identifier,
                name: name.trim(),
                user_type: userType || 'individual',
                language: language || 'en',
                terms_accepted_at: new Date().toISOString()
            };
            
            const { data: newUser, error } = await supabase
                .from('users')
                .insert(userData)
                .select()
                .single();
            
            if (error) {
                console.error('Create user error:', error);
                return res.status(500).json({ error: 'Failed to create account' });
            }
            
            user = newUser;
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
                email: user.email,
                mobile: user.mobile,
                name: user.name,
                userType: user.user_type,
                language: user.language
            }
        });
    } catch (error) {
        console.error('Complete registration error:', error);
        res.status(500).json({ error: 'Failed to complete registration' });
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
