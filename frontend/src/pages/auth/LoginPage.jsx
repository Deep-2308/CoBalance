import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, Mail, Phone } from 'lucide-react';
import api from '../../services/api';

const LoginPage = () => {
    const [identifier, setIdentifier] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Detect input type
    const detectType = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(value)) return 'email';
        if (/^\+?[0-9]{10,15}$/.test(value.replace(/\s/g, ''))) return 'mobile';
        return null;
    };

    const inputType = detectType(identifier);

    const formatIdentifier = (value) => {
        if (inputType === 'mobile' && !value.startsWith('+')) {
            return `+91${value.replace(/\s/g, '')}`;
        }
        return value.trim();
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');

        if (!inputType) {
            setError('Please enter a valid email or mobile number');
            return;
        }

        setLoading(true);

        try {
            const formattedIdentifier = formatIdentifier(identifier);
            
            const response = await api.post('/auth/login/send-otp', {
                identifier: formattedIdentifier
            });

            // In development mode, show OTP
            if (response.data._dev_otp) {
                console.log('🔐 Your OTP:', response.data._dev_otp);
                alert(`Your OTP: ${response.data._dev_otp}\n(Development mode)`);
            }

            navigate('/auth/verify-otp', { 
                state: { 
                    identifier: formattedIdentifier,
                    identifierType: response.data.identifierType,
                    flow: 'login'
                } 
            });
        } catch (err) {
            console.error('Send OTP error:', err);
            const errorData = err.response?.data;
            
            if (errorData?.code === 'USER_NOT_FOUND') {
                setError(errorData.error);
            } else {
                setError(errorData?.error || 'Failed to send OTP. Please try again.');
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
                            <p className="text-slate-400">Enter your email or mobile to login</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSendOTP}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email or Mobile Number
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        {inputType === 'email' ? (
                                            <Mail className="w-5 h-5" />
                                        ) : (
                                            <Phone className="w-5 h-5" />
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        placeholder="email@example.com or 9876543210"
                                        required
                                    />
                                </div>
                                {inputType && (
                                    <p className="mt-2 text-xs text-primary-400">
                                        Detected: {inputType === 'email' ? 'Email address' : 'Mobile number'}
                                    </p>
                                )}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-sm text-red-400">{error}</p>
                                    {error.includes('not found') && (
                                        <Link 
                                            to="/auth/register" 
                                            className="inline-block mt-2 text-sm text-primary-400 hover:text-primary-300 underline"
                                        >
                                            Create an account instead →
                                        </Link>
                                    )}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !inputType}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? (
                                    <span>Sending OTP...</span>
                                ) : (
                                    <>
                                        <span>Send OTP</span>
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Register Link */}
                        <div className="mt-8 text-center">
                            <p className="text-slate-500">
                                Don't have an account?{' '}
                                <Link 
                                    to="/auth/register" 
                                    className="text-primary-400 hover:text-primary-300 font-medium"
                                >
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
