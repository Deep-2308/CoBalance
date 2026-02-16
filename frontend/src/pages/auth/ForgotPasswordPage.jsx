import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email: email.trim() });
            setSent(true);
        } catch (err) {
            const status = err.response?.status;
            if (status === 429) {
                setError('Too many requests. Please try again later.');
            } else {
                setError('Something went wrong. Please try again.');
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
                    {sent ? (
                        /* ── Success State ── */
                        <div className="text-center animate-fade-in">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full mb-6">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <h1 className="text-2xl font-display font-bold text-white mb-3">
                                Check Your Email
                            </h1>
                            <p className="text-primary-300 mb-8 leading-relaxed">
                                If an account exists for <span className="text-white font-medium">{email}</span>, 
                                we've sent a password reset link. Check your inbox and spam folder.
                            </p>
                            <Link
                                to="/auth/login-password"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        /* ── Form State ── */
                        <div className="animate-fade-in">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-14 h-14 bg-accent-500/20 border border-accent-500/30 rounded-2xl mb-4">
                                    <Mail className="w-7 h-7 text-accent-400" />
                                </div>
                                <h1 className="text-2xl font-display font-bold text-white mb-2">
                                    Forgot Password?
                                </h1>
                                <p className="text-primary-300 text-sm">
                                    Enter your email and we'll send you a reset link
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email Input */}
                                <div>
                                    <label className="block text-sm font-medium text-primary-200 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError('');
                                            }}
                                            placeholder="you@example.com"
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <p className="text-sm text-red-400">{error}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || !email.trim()}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-display font-semibold rounded-xl shadow-lg shadow-accent-500/25 hover:shadow-xl hover:shadow-accent-500/40 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send Reset Link
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

export default ForgotPasswordPage;
