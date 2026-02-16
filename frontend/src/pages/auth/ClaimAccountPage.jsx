import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Lock, Eye, EyeOff, User, CheckCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ClaimAccountPage = () => {
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const canSubmit = mobile.trim().length >= 10 && password.length >= 6 && password === confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!mobile.trim()) {
            setError('Please enter your phone number');
            return;
        }

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
            const response = await api.post('/auth/claim-account', {
                mobile: mobile.trim(),
                password,
                email: email.trim() || undefined,
            });

            const { token, user } = response.data;
            login(token, user);
            setSuccess(true);

            // Redirect to dashboard after 2 seconds
            setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
        } catch (err) {
            const code = err.response?.data?.code;
            const status = err.response?.status;

            if (code === 'USER_NOT_FOUND') {
                setError('No account found with this phone number. Please check and try again.');
            } else if (code === 'ALREADY_MIGRATED') {
                setError('This account already has a password. Please use the login page instead.');
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex flex-col relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <div className="relative z-10 px-4 pt-6">
                <Link
                    to="/auth/login-password"
                    className="inline-flex items-center gap-2 text-primary-300 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back to Login</span>
                </Link>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
                <div className="w-full max-w-sm">
                    {success ? (
                        /* ── Success State ── */
                        <div className="text-center animate-fade-in">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full mb-6">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <h1 className="text-2xl font-display font-bold text-white mb-3">
                                Account Set Up!
                            </h1>
                            <p className="text-primary-300 mb-6">
                                Your password has been set. Redirecting to dashboard...
                            </p>
                            <div className="w-5 h-5 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin mx-auto" />
                        </div>
                    ) : (
                        /* ── Form State ── */
                        <div className="animate-fade-in">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500/20 border border-amber-500/30 rounded-2xl mb-4">
                                    <ShieldAlert className="w-7 h-7 text-amber-400" />
                                </div>
                                <h1 className="text-2xl font-display font-bold text-white mb-2">
                                    Set Up Your Account
                                </h1>
                                <p className="text-primary-300 text-sm leading-relaxed">
                                    Already had an account with your phone number?<br />
                                    Set a password to access it again.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Phone Number */}
                                <div>
                                    <label className="block text-sm font-medium text-primary-200 mb-1.5">
                                        Phone Number <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                                        <input
                                            type="tel"
                                            value={mobile}
                                            onChange={(e) => { setMobile(e.target.value); setError(''); }}
                                            placeholder="Your registered phone number"
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Email (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium text-primary-200 mb-1.5">
                                        Email Address <span className="text-primary-500">(optional but recommended)</span>
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
                                        Adding email enables password recovery
                                    </p>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-primary-200 mb-1.5">
                                        Set Password <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                            placeholder="Minimum 6 characters"
                                            className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
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

                                {/* Password match indicator */}
                                {confirmPassword && (
                                    <p className={`text-sm ${password === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                                        {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}

                                {/* Error */}
                                {error && (
                                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <p className="text-sm text-red-400">{error}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || !canSubmit}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-display font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Set Up Account
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Info */}
                            <div className="mt-6 px-4 py-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                                <p className="text-xs text-amber-300/80 leading-relaxed">
                                    💡 This is for accounts created before the password system. 
                                    If you're new, please <Link to="/auth/signup-password" className="underline hover:text-amber-200">create an account</Link> instead.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClaimAccountPage;
