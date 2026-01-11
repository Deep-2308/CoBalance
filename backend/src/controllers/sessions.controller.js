import crypto from 'crypto';
import supabase from '../utils/supabase.js';

// Helper: Hash token for storage (we don't store actual JWTs)
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

// Helper: Parse device info from user agent
const parseDeviceInfo = (userAgent) => {
    if (!userAgent) return { deviceType: 'unknown', deviceName: 'Unknown Device' };
    
    let deviceType = 'desktop';
    let deviceName = 'Unknown Browser';
    
    // Detect device type
    if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
        deviceType = /ipad|tablet/i.test(userAgent) ? 'tablet' : 'mobile';
    }
    
    // Detect browser/OS
    if (/chrome/i.test(userAgent)) deviceName = 'Chrome';
    else if (/firefox/i.test(userAgent)) deviceName = 'Firefox';
    else if (/safari/i.test(userAgent)) deviceName = 'Safari';
    else if (/edge/i.test(userAgent)) deviceName = 'Edge';
    
    // Add OS
    if (/windows/i.test(userAgent)) deviceName += ' on Windows';
    else if (/mac/i.test(userAgent)) deviceName += ' on Mac';
    else if (/android/i.test(userAgent)) deviceName += ' on Android';
    else if (/iphone|ipad/i.test(userAgent)) deviceName += ' on iOS';
    else if (/linux/i.test(userAgent)) deviceName += ' on Linux';
    
    return { deviceType, deviceName };
};

// Create a new session (called after login)
export const createSession = async (userId, token, req) => {
    const tokenHash = hashToken(token);
    const userAgent = req.headers['user-agent'] || '';
    const { deviceType, deviceName } = parseDeviceInfo(userAgent);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    
    if (process.env.OTP_PROVIDER === 'mock' || !supabase) {
        console.log('📱 [MOCK] Session created for user:', userId);
        return { id: 'mock-session-' + Date.now(), deviceType, deviceName };
    }
    
    try {
        const { data: session, error } = await supabase
            .from('user_sessions')
            .insert({
                user_id: userId,
                token_hash: tokenHash,
                device_type: deviceType,
                device_name: deviceName,
                ip_address: ipAddress,
                is_current: true
            })
            .select()
            .single();
        
        if (error) throw error;
        return session;
    } catch (error) {
        console.error('Create session error:', error);
        return null;
    }
};

// Get all active sessions for a user
export const getSessions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const currentToken = req.headers.authorization?.replace('Bearer ', '');
        const currentTokenHash = currentToken ? hashToken(currentToken) : null;
        
        if (process.env.OTP_PROVIDER === 'mock' || !supabase) {
            return res.json({
                success: true,
                sessions: [
                    {
                        id: 'mock-session-1',
                        deviceType: 'mobile',
                        deviceName: 'Chrome on Android',
                        lastActiveAt: new Date().toISOString(),
                        isCurrent: true
                    },
                    {
                        id: 'mock-session-2',
                        deviceType: 'desktop',
                        deviceName: 'Firefox on Windows',
                        lastActiveAt: new Date(Date.now() - 86400000).toISOString(),
                        isCurrent: false
                    }
                ]
            });
        }
        
        const { data: sessions, error } = await supabase
            .from('user_sessions')
            .select('id, device_type, device_name, last_active_at, token_hash, created_at')
            .eq('user_id', userId)
            .order('last_active_at', { ascending: false });
        
        if (error) throw error;
        
        res.json({
            success: true,
            sessions: sessions.map(s => ({
                id: s.id,
                deviceType: s.device_type,
                deviceName: s.device_name,
                lastActiveAt: s.last_active_at,
                createdAt: s.created_at,
                isCurrent: s.token_hash === currentTokenHash
            }))
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ error: 'Failed to get sessions' });
    }
};

// Logout a specific session
export const logoutSession = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { sessionId } = req.params;
        
        if (process.env.OTP_PROVIDER === 'mock' || !supabase) {
            return res.json({ success: true, message: 'Session logged out' });
        }
        
        const { error } = await supabase
            .from('user_sessions')
            .delete()
            .eq('id', sessionId)
            .eq('user_id', userId); // Ensure user owns this session
        
        if (error) throw error;
        
        res.json({ success: true, message: 'Session logged out' });
    } catch (error) {
        console.error('Logout session error:', error);
        res.status(500).json({ error: 'Failed to logout session' });
    }
};

// Logout all sessions (except current)
export const logoutAllSessions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const currentToken = req.headers.authorization?.replace('Bearer ', '');
        const currentTokenHash = currentToken ? hashToken(currentToken) : null;
        
        if (process.env.OTP_PROVIDER === 'mock' || !supabase) {
            return res.json({ success: true, message: 'All other sessions logged out' });
        }
        
        // Delete all sessions except current
        const { error } = await supabase
            .from('user_sessions')
            .delete()
            .eq('user_id', userId)
            .neq('token_hash', currentTokenHash);
        
        if (error) throw error;
        
        res.json({ success: true, message: 'All other sessions logged out' });
    } catch (error) {
        console.error('Logout all sessions error:', error);
        res.status(500).json({ error: 'Failed to logout sessions' });
    }
};

// Update session last active time (middleware helper)
export const updateSessionActivity = async (userId, token) => {
    if (process.env.OTP_PROVIDER === 'mock' || !supabase) return;
    
    const tokenHash = hashToken(token);
    
    try {
        await supabase
            .from('user_sessions')
            .update({ last_active_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('token_hash', tokenHash);
    } catch (error) {
        console.error('Update session activity error:', error);
    }
};
