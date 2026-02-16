import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Validate the link has required params
    if (!token || !email) {
        return (
            <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-6">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full mb-6">
                        <ShieldCheck className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-display font-bold text-white mb-3">
                        Invalid Reset Link
                    </h1>
                    <p className="text-primary-300 mb-6">
                        This password reset link is invalid or has expired.
                    </p>
                    <Link
                        to="/auth/forgot-password"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white font-medium rounded-xl hover:bg-accent-600 transition-colors"
                    >
                        Request a New Link
                    </Link>
                </div>
            </div>
        );
    }

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
            await api.post('/auth/reset-password', {
                token,
                email,
                newPassword: password
            });
            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => navigate('/auth/login-password'), 3000);
        } catch (err) {
            const code = err.response?.data?.code;
            if (code === 'INVALID_TOKEN') {
                setError('This reset link has expired. Please request a new one.');
            } else {
                setError(err.response?.data?.error || 'Failed to reset password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-warm flex flex-col relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
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
                                Password Reset!
                            </h1>
                            <p className="text-primary-300 mb-6">
                                Your password has been updated. Redirecting to login...
                            </p>
                            <div className="w-5 h-5 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin mx-auto" />
                        </div>
                    ) : (
                        /* ── Form State ── */
                        <div className="animate-fade-in">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-14 h-14 bg-accent-500/20 border border-accent-500/30 rounded-2xl mb-4">
                                    <ShieldCheck className="w-7 h-7 text-accent-400" />
                                </div>
                                <h1 className="text-2xl font-display font-bold text-white mb-2">
                                    Set New Password
                                </h1>
                                <p className="text-primary-300 text-sm">
                                    Choose a strong password for your account
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-primary-200 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setError('');
                                            }}
                                            placeholder="Minimum 6 characters"
                                            className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all"
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
                                    <label className="block text-sm font-medium text-primary-200 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setError('');
                                            }}
                                            placeholder="Re-enter password"
                                            className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 hover:text-white transition-colors"
                                        >
                                            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
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
                                    disabled={loading || !password || !confirmPassword}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-display font-semibold rounded-xl shadow-lg shadow-accent-500/25 hover:shadow-xl hover:shadow-accent-500/40 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            Reset Password
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

export default ResetPasswordPage;
