import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, LogIn, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { detectIdentifierType, transformForApi } from '../../utils/identifierHelper';
import api from '../../services/api';

const LoginWithPasswordPage = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const inputType = detectIdentifierType(identifier);
    const isValid = inputType === 'email' || inputType === 'phone';
    const canSubmit = isValid && password.length >= 6;

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!isValid) {
            setError('Please enter a valid email or phone number');
            return;
        }

        setLoading(true);

        try {
            const email = transformForApi(identifier);
            const response = await api.post('/auth/login-password', {
                email,
                password
            });

            // Check if backend detected a legacy user needing migration
            if (response.data.status === 'MIGRATION_REQUIRED') {
                navigate('/auth/set-password', {
                    state: { migrationToken: response.data.migrationToken },
                    replace: true
                });
                return;
            }

            const { token, user } = response.data;
            login(token, user);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            console.error('Password login error:', err);
            const status = err.response?.status;
            const errorData = err.response?.data;

            if (status === 423) {
                const mins = errorData?.retryAfter || 15;
                setError(`Too many failed attempts. Account locked for ${mins} minute${mins !== 1 ? 's' : ''}. Try again later.`);
            } else if (status === 429) {
                setError('Too many login attempts. Please wait and try again later.');
            } else if (errorData?.code === 'INVALID_CREDENTIALS') {
                setError('Invalid credentials. Please check and try again.');
            } else {
                setError(errorData?.error || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex flex-col">
            {/* Decorative Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <div className="relative z-10 p-4">
                <button
                    onClick={() => navigate('/auth')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
                <div className="w-full max-w-md">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                            <p className="text-slate-400">Login with your email or phone</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLogin}>
                            {/* Email or Phone */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email or Phone Number
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        {inputType === 'phone' ? (
                                            <Phone className="w-5 h-5" />
                                        ) : (
                                            <Mail className="w-5 h-5" />
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        placeholder="you@example.com or 9876543210"
                                        required
                                        autoComplete="username"
                                    />
                                </div>
                                {inputType && (
                                    <p className="mt-2 text-xs text-primary-400">
                                        Detected: {inputType === 'email' ? 'Email address' : 'Phone number'}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        placeholder="Enter your password"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Forgot Password Link */}
                                <div className="flex justify-end -mt-1">
                                    <Link
                                        to="/auth/forgot-password"
                                        className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !canSubmit}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? (
                                    <span>Logging in...</span>
                                ) : (
                                    <>
                                        <span>Login</span>
                                        <LogIn className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Links */}
                        <div className="mt-8 text-center">
                            <p className="text-slate-500">
                                Don't have an account?{' '}
                                <Link
                                    to="/auth/signup-password"
                                    className="text-primary-400 hover:text-primary-300 font-medium"
                                >
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginWithPasswordPage;
