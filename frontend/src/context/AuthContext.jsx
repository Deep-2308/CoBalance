import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { transformForApi } from '../utils/identifierHelper';

const AuthContext = createContext(null);

// Decode JWT expiration (seconds since epoch)
const getTokenExpiry = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp ? payload.exp * 1000 : null; // Convert to ms
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);
    const expiryTimerRef = useRef(null);

    // ── Logout ──
    const logout = useCallback(() => {
        clearTimeout(expiryTimerRef.current);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    // ── Schedule auto-logout when JWT expires ──
    // NOTE: setTimeout uses a 32-bit signed int internally.
    // Max safe delay = 2^31 - 1 = ~24.8 days. Our 30-day JWT exceeds this,
    // causing an overflow that fires the timer IMMEDIATELY.
    // Fix: cap at 12 hours and re-check on each tick.
    const MAX_TIMEOUT_MS = 12 * 60 * 60 * 1000; // 12 hours

    const scheduleAutoLogout = useCallback((token) => {
        clearTimeout(expiryTimerRef.current);
        const expiryMs = getTokenExpiry(token);
        if (!expiryMs) return;

        const msUntilExpiry = expiryMs - Date.now();

        if (msUntilExpiry <= 0) {
            // Already expired
            logout();
            setSessionExpired(true);
            return;
        }

        // Cap the delay to avoid 32-bit overflow, re-schedule if needed
        const delay = Math.min(msUntilExpiry, MAX_TIMEOUT_MS);

        expiryTimerRef.current = setTimeout(() => {
            // Re-check actual expiry (don't blindly logout on capped timer)
            const remaining = expiryMs - Date.now();
            if (remaining <= 0) {
                console.warn('⏰ JWT expired — auto-logging out');
                logout();
                setSessionExpired(true);
            } else {
                // Token still valid, re-schedule
                scheduleAutoLogout(token);
            }
        }, delay);
    }, [logout]);

    // ── Initialize from localStorage ──
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            const expiryMs = getTokenExpiry(token);
            if (expiryMs && expiryMs <= Date.now()) {
                // Token already expired
                logout();
                setSessionExpired(true);
            } else {
                setUser(JSON.parse(savedUser));
                scheduleAutoLogout(token);
            }
        }
        setLoading(false);
    }, [logout, scheduleAutoLogout]);

    // ── Listen for session-expired events from axios interceptor ──
    useEffect(() => {
        const handleSessionExpired = () => {
            logout();
            setSessionExpired(true);
        };

        window.addEventListener('auth:session-expired', handleSessionExpired);
        return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
    }, [logout]);

    // ── Login (store token + schedule expiry) ──
    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setSessionExpired(false);
        scheduleAutoLogout(token);
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // ── Clear session expired flag ──
    const clearSessionExpired = () => setSessionExpired(false);

    // ============================================
    // EMAIL/PASSWORD AUTH METHODS
    // Phone numbers auto-transform to phone@cobalance.app
    // ============================================

    const loginWithPassword = async (identifier, password) => {
        const email = transformForApi(identifier);
        const response = await api.post('/auth/login-password', { email, password });
        const { token, user: userData } = response.data;
        login(token, userData);
        return response.data;
    };

    const signupWithPassword = async (identifier, password, name) => {
        const email = transformForApi(identifier);
        const response = await api.post('/auth/signup-password', { email, password, name });
        const { token, user: userData } = response.data;
        login(token, userData);
        return response.data;
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            updateUser,
            loginWithPassword,
            signupWithPassword,
            loading,
            sessionExpired,
            clearSessionExpired
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
