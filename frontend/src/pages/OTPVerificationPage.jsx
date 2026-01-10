import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import AuthService, { IS_MOCK_AUTH } from '../services/auth';
import { useAuth } from '../context/AuthContext';

const OTPVerificationPage = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const mobile = location.state?.mobile;

    useEffect(() => {
        if (!mobile) {
            navigate('/login');
            return;
        }

        const timer = setInterval(() => {
            setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [mobile, navigate]);

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);

        try {
            // Use AuthService - works with both mock and real backend
            const result = await AuthService.verifyOTP(mobile, otp);
            const { token, user } = result;

            // Update auth context
            login(token, user);

            // Navigate based on user status
            if (user.isNewUser) {
                navigate('/language-selection');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Verify OTP error:', err);
            setError(err.response?.data?.error || err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;

        setError('');
        try {
            await AuthService.sendOTP(mobile);
            setResendTimer(60);
            
            // Show success message
            if (IS_MOCK_AUTH) {
                alert('Mock OTP re-sent! Use any 6-digit code.');
            }
        } catch (err) {
            console.error('Resend OTP error:', err);
            setError('Failed to resend OTP');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Development Mode Banner */}
                {IS_MOCK_AUTH && (
                    <div className="bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg mb-4 text-sm text-center font-medium">
                        🔧 Mock Mode - Any 6-digit code works!
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-6">
                        <CheckCircle className="w-16 h-16 mx-auto text-primary-600 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h2>
                        <p className="text-gray-600">
                            Enter the 6-digit code sent to
                            <br />
                            <span className="font-medium text-gray-900">{mobile}</span>
                        </p>
                    </div>

                    <form onSubmit={handleVerifyOTP}>
                        <div className="mb-4">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="input text-center text-2xl tracking-widest font-bold"
                                placeholder="000000"
                                maxLength="6"
                                autoFocus
                                required
                            />
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="btn btn-primary w-full mb-4"
                        >
                            {loading ? 'Verifying...' : 'Verify & Continue'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendTimer > 0}
                                className="text-sm text-primary-600 hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OTPVerificationPage;
