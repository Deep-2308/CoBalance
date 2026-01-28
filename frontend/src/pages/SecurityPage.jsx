import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Shield, 
    Smartphone, 
    Monitor, 
    Tablet,
    Mail,
    Phone,
    LogOut,
    Trash2,
    Check,
    AlertTriangle,
    Clock,
    Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const SecurityPage = () => {
    const navigate = useNavigate();
    const { logout: authLogout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [security, setSecurity] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Email verification state
    const [showEmailVerify, setShowEmailVerify] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailOtp, setEmailOtp] = useState('');
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [devOtp, setDevOtp] = useState('');
    
    // Deletion state
    const [showDeletionConfirm, setShowDeletionConfirm] = useState(false);
    const [deletionReason, setDeletionReason] = useState('');
    const [deletionLoading, setDeletionLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [securityRes, sessionsRes] = await Promise.all([
                api.get('/security/overview'),
                api.get('/security/sessions')
            ]);
            setSecurity(securityRes.data.security);
            setSessions(sessionsRes.data.sessions);
        } catch (err) {
            console.error('Failed to fetch security data:', err);
            setError('Failed to load security information');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutSession = async (sessionId) => {
        try {
            await api.delete(`/security/sessions/${sessionId}`);
            setSessions(sessions.filter(s => s.id !== sessionId));
            setSuccess('Session logged out');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to logout session');
        }
    };

    const handleLogoutAllSessions = async () => {
        if (!window.confirm('This will log you out from all other devices. Continue?')) return;
        
        try {
            await api.post('/security/sessions/logout-all');
            setSessions(sessions.filter(s => s.isCurrent));
            setSuccess('Logged out from all other devices');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to logout sessions');
        }
    };

    const handleSendEmailOtp = async () => {
        if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            setError('Please enter a valid email address');
            return;
        }
        
        setEmailLoading(true);
        setError('');
        
        try {
            const res = await api.post('/security/email/send-otp', { email: newEmail });
            setEmailOtpSent(true);
            if (res.data._dev_otp) {
                setDevOtp(res.data._dev_otp);
            }
            setSuccess('Verification code sent to your email');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send verification code');
        } finally {
            setEmailLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (!emailOtp || emailOtp.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
        }
        
        setEmailLoading(true);
        setError('');
        
        try {
            await api.post('/security/email/verify-otp', { email: newEmail, otp: emailOtp });
            setSecurity({ ...security, email: newEmail, emailVerified: true });
            setShowEmailVerify(false);
            setNewEmail('');
            setEmailOtp('');
            setEmailOtpSent(false);
            setDevOtp('');
            setSuccess('Email verified successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid verification code');
        } finally {
            setEmailLoading(false);
        }
    };

    const handleRequestDeletion = async () => {
        setDeletionLoading(true);
        setError('');
        
        try {
            await api.post('/security/account/request-deletion', { reason: deletionReason });
            authLogout();
            navigate('/auth');
        } catch (err) {
            setError('Failed to request account deletion');
            setDeletionLoading(false);
        }
    };

    const getDeviceIcon = (deviceType) => {
        switch (deviceType) {
            case 'mobile': return Smartphone;
            case 'tablet': return Tablet;
            default: return Monitor;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Security & Account</h1>
                </div>
            </div>

            <div className="px-4 py-6 space-y-4">
                {/* Messages */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-green-600">{success}</p>
                    </div>
                )}

                {/* Security Overview */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-5 h-5 text-primary-600" />
                        <h3 className="font-bold text-gray-900">Security Overview</h3>
                    </div>

                    <div className="space-y-3">
                        {/* Primary Login */}
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone (Primary)</p>
                                    <p className="font-medium text-gray-900">{security?.mobile || '—'}</p>
                                </div>
                            </div>
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                Verified
                            </span>
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">
                                        {security?.email || 'Not added'}
                                    </p>
                                </div>
                            </div>
                            {security?.email ? (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    security.emailVerified 
                                        ? 'text-green-600 bg-green-50' 
                                        : 'text-yellow-600 bg-yellow-50'
                                }`}>
                                    {security.emailVerified ? 'Verified' : 'Unverified'}
                                </span>
                            ) : (
                                <button
                                    onClick={() => setShowEmailVerify(true)}
                                    className="text-sm text-primary-600 font-medium"
                                >
                                    Add Email
                                </button>
                            )}
                        </div>

                        {!security?.emailVerified && security?.email && (
                            <button
                                onClick={() => {
                                    setNewEmail(security.email);
                                    setShowEmailVerify(true);
                                }}
                                className="w-full py-2 text-sm text-primary-600 font-medium bg-primary-50 rounded-lg"
                            >
                                Verify Email
                            </button>
                        )}
                    </div>
                </div>

                {/* Email Verification Modal */}
                {showEmailVerify && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-primary-200">
                        <h3 className="font-bold text-gray-900 mb-4">
                            {emailOtpSent ? 'Enter Verification Code' : 'Verify Email'}
                        </h3>

                        {!emailOtpSent ? (
                            <div className="space-y-4">
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="input"
                                    placeholder="Enter email address"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowEmailVerify(false)}
                                        className="flex-1 py-3 text-gray-600 font-medium bg-gray-100 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendEmailOtp}
                                        disabled={emailLoading}
                                        className="flex-1 py-3 text-white font-medium bg-primary-600 rounded-xl flex items-center justify-center gap-2"
                                    >
                                        {emailLoading ? 'Sending...' : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Send Code
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500">
                                    Enter the 6-digit code sent to {newEmail}
                                </p>
                                {devOtp && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-xs text-yellow-700">Dev OTP: <strong>{devOtp}</strong></p>
                                    </div>
                                )}
                                <input
                                    type="text"
                                    value={emailOtp}
                                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="input text-center text-2xl tracking-widest"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEmailOtpSent(false);
                                            setEmailOtp('');
                                        }}
                                        className="flex-1 py-3 text-gray-600 font-medium bg-gray-100 rounded-xl"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleVerifyEmail}
                                        disabled={emailLoading || emailOtp.length !== 6}
                                        className="flex-1 py-3 text-white font-medium bg-primary-600 rounded-xl disabled:opacity-50"
                                    >
                                        {emailLoading ? 'Verifying...' : 'Verify'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Active Sessions */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-primary-600" />
                            <h3 className="font-bold text-gray-900">Active Sessions</h3>
                        </div>
                        {sessions.length > 1 && (
                            <button
                                onClick={handleLogoutAllSessions}
                                className="text-sm text-red-600 font-medium"
                            >
                                Logout All
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {sessions.map((session) => {
                            const DeviceIcon = getDeviceIcon(session.deviceType);
                            return (
                                <div 
                                    key={session.id}
                                    className={`flex items-center justify-between p-3 rounded-xl ${
                                        session.isCurrent ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <DeviceIcon className={`w-5 h-5 ${
                                            session.isCurrent ? 'text-primary-600' : 'text-gray-400'
                                        }`} />
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">
                                                {session.deviceName}
                                                {session.isCurrent && (
                                                    <span className="ml-2 text-xs text-primary-600">(Current)</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                    {!session.isCurrent && (
                                        <button
                                            onClick={() => handleLogoutSession(session.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Account Deletion */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-red-100">
                    <div className="flex items-center gap-3 mb-4">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <h3 className="font-bold text-gray-900">Delete Account</h3>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                        Request permanent deletion of your account and all data. This action cannot be undone.
                    </p>

                    {!showDeletionConfirm ? (
                        <button
                            onClick={() => setShowDeletionConfirm(true)}
                            className="w-full py-3 text-red-600 font-medium bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                        >
                            Request Account Deletion
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">Warning</p>
                                    <p className="text-xs text-yellow-700">
                                        Your account will be permanently deleted within 30 days. 
                                        All your data, transactions, and group history will be lost.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    Reason for leaving (optional)
                                </label>
                                <textarea
                                    value={deletionReason}
                                    onChange={(e) => setDeletionReason(e.target.value)}
                                    className="input min-h-[80px] resize-none"
                                    placeholder="Help us improve by sharing your reason..."
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowDeletionConfirm(false)}
                                    className="flex-1 py-3 text-gray-600 font-medium bg-gray-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRequestDeletion}
                                    disabled={deletionLoading}
                                    className="flex-1 py-3 text-white font-medium bg-red-600 rounded-xl"
                                >
                                    {deletionLoading ? 'Processing...' : 'Confirm Deletion'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecurityPage;
