import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Mail, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Store migration token in a ref so it survives re-renders after login()
    const migrationTokenRef = useRef(location.state?.migrationToken || null);
    const hasToken = migrationTokenRef.current !== null;

    // If no migration token on mount, redirect back to login
    useEffect(() => {
        if (!hasToken) {
            navigate('/auth/login-password', { replace: true });
        }
    }, []); // Run only once on mount

    const canSubmit = password.length >= 6 && password === confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/set-password', {
                migrationToken: migrationTokenRef.current,
                password,
                email: email.trim() || undefined,
            });

            const { token, user } = response.data;
            login(token, user);
            setSuccess(true);

            // Redirect to dashboard
            setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
        } catch (err) {
            const code = err.response?.data?.code;
            const status = err.response?.status;

            if (code === 'TOKEN_EXPIRED') {
                setError('Session expired. Please go back to login and try again.');
            } else if (code === 'ALREADY_MIGRATED') {
                setError('Password already set. Redirecting to login...');
                setTimeout(() => navigate('/auth/login-password', { replace: true }), 2000);
            } else if (code === 'EMAIL_TAKEN') {
                setError('This email is already used by another account.');
            } else if (status === 429) {
                setError('Too many attempts. Please try again later.');
            } else {
                setError(err.response?.data?.error || 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!hasToken) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex flex-col relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
                <div className="w-full max-w-sm">
                    {success ? (
                        /* ── Success ── */
                        <div className="text-center animate-fade-in">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full mb-6">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <h1 className="text-2xl font-display font-bold text-white mb-3">
                                You're All Set!
                            </h1>
                            <p className="text-primary-300 mb-6">
                                Password set successfully. Redirecting to dashboard...
                            </p>
                            <div className="w-5 h-5 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin mx-auto" />
                        </div>
                    ) : (
                        /* ── Form ── */
                        <div className="animate-fade-in">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500/20 border border-amber-500/30 rounded-2xl mb-4">
                                    <ShieldCheck className="w-7 h-7 text-amber-400" />
                                </div>
                                <h1 className="text-2xl font-display font-bold text-white mb-2">
                                    Set Your Password
                                </h1>
                                <p className="text-primary-300 text-sm leading-relaxed">
                                    Your account needs a password to continue.<br />
                                    This is a one-time setup.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-primary-200 mb-1.5">
                                        New Password <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                            placeholder="Minimum 6 characters"
                                            className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-primary-200 mb-1.5">
                                        Confirm Password <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                            placeholder="Re-enter password"
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Match indicator */}
                                {confirmPassword && (
                                    <p className={`text-sm ${password === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                                        {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}

                                {/* Optional Email */}
                                <div>
                                    <label className="block text-sm font-medium text-primary-200 mb-1.5">
                                        Email <span className="text-primary-500">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-primary-500">
                                        Adding email enables password recovery in the future
                                    </p>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <p className="text-sm text-red-400">{error}</p>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading || !canSubmit}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-display font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            Set Password & Continue
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SetPasswordPage;
