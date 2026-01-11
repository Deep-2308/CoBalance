import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const OTPVerifyPage = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const { identifier, identifierType, flow } = location.state || {};

    useEffect(() => {
        if (!identifier || !flow) {
            navigate('/auth');
            return;
        }

        const timer = setInterval(() => {
            setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [identifier, flow, navigate]);

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);

        try {
            const endpoint = flow === 'login' 
                ? '/auth/login/verify-otp' 
                : '/auth/register/verify-otp';
            
            const response = await api.post(endpoint, { identifier, otp });

            if (flow === 'login') {
                // Login flow: Get token and user, redirect to dashboard
                const { token, user } = response.data;
                login(token, user);
                navigate('/dashboard');
            } else {
                // Register flow: Get temp token, redirect to complete registration
                const { tempToken, identifier: verifiedIdentifier, identifierType: verifiedType } = response.data;
                navigate('/auth/register/complete', {
                    state: {
                        tempToken,
                        identifier: verifiedIdentifier,
                        identifierType: verifiedType
                    }
                });
            }
        } catch (err) {
            console.error('Verify OTP error:', err);
            const errorData = err.response?.data;
            
            if (errorData?.code === 'TOKEN_EXPIRED') {
                setError('Session expired. Please start over.');
            } else {
                setError(errorData?.error || 'Invalid OTP. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;

        setError('');
        try {
            const endpoint = flow === 'login' 
                ? '/auth/login/send-otp' 
                : '/auth/register/send-otp';
            
            const response = await api.post(endpoint, { identifier });
            
            setResendTimer(60);
            
            if (response.data._dev_otp) {
                console.log('🔐 New OTP:', response.data._dev_otp);
                alert(`New OTP: ${response.data._dev_otp}\n(Development mode)`);
            }
        } catch (err) {
            console.error('Resend OTP error:', err);
            setError('Failed to resend OTP. Please try again.');
        }
    };

    const formatIdentifier = (id, type) => {
        if (type === 'mobile' && id.length > 4) {
            return `******${id.slice(-4)}`;
        }
        if (type === 'email') {
            const [local, domain] = id.split('@');
            if (local.length > 2) {
                return `${local.slice(0, 2)}****@${domain}`;
            }
        }
        return id;
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
                    onClick={() => navigate(flow === 'login' ? '/auth/login' : '/auth/register')}
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
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Verify OTP</h1>
                            <p className="text-slate-400">
                                Enter the 6-digit code sent to
                            </p>
                            <p className="text-primary-400 font-medium mt-1">
                                {formatIdentifier(identifier, identifierType)}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleVerifyOTP}>
                            <div className="mb-6">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-center text-3xl tracking-[0.5em] font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="000000"
                                    maxLength="6"
                                    autoFocus
                                    required
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-sm text-red-400">{error}</p>
                                    {error.includes('start over') && (
                                        <Link 
                                            to={flow === 'login' ? '/auth/login' : '/auth/register'}
                                            className="inline-block mt-2 text-sm text-primary-400 hover:text-primary-300 underline"
                                        >
                                            Go back →
                                        </Link>
                                    )}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? 'Verifying...' : 'Verify & Continue'}
                            </button>
                        </form>

                        {/* Resend OTP */}
                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendTimer > 0}
                                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary-400 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                {resendTimer > 0 
                                    ? `Resend OTP in ${resendTimer}s` 
                                    : 'Resend OTP'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPVerifyPage;
