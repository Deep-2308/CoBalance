import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import AuthService, { IS_MOCK_AUTH } from '../services/auth';

const LoginPage = () => {
    const [mobile, setMobile] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');

        if (!mobile || mobile.length < 10) {
            setError('Please enter a valid mobile number');
            return;
        }

        setLoading(true);

        try {
            const formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;
            
            // Use AuthService (automatically switches based on VITE_USE_MOCK_AUTH)
            const result = await AuthService.sendOTP(formattedMobile);

            // In development/mock mode, show OTP in alert for easy testing
            if (result._dev_otp) {
                console.log('🔐 Your OTP:', result._dev_otp);
                
                // Show alert only in mock mode for better UX
                if (IS_MOCK_AUTH) {
                    alert(`Mock OTP: ${result._dev_otp}\n(Any 6-digit code works in mock mode)`);
                } else {
                    // Real backend in dev mode - show OTP for testing
                    alert(`Your OTP: ${result._dev_otp}\n(Check console too)`);
                }
            }

            navigate('/verify-otp', { state: { mobile: formattedMobile } });
        } catch (err) {
            console.error('Send OTP error:', err);
            setError(err.response?.data?.error || err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">CoBalance</h1>
                    <p className="text-primary-100">Smart ledger & expense sharing</p>
                </div>

                {/* Development Mode Banner */}
                {IS_MOCK_AUTH && (
                    <div className="bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg mb-4 text-sm text-center font-medium">
                        🔧 Mock Auth Mode - No Backend Required
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome</h2>
                    <p className="text-gray-600 mb-6">Enter your mobile number to get started</p>

                    <form onSubmit={handleSendOTP}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Number
                            </label>
                            <div className="flex">
                                <div className="flex items-center px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                                    <span className="text-gray-600">+91</span>
                                </div>
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                    className="input rounded-l-none flex-1"
                                    placeholder="9876543210"
                                    maxLength="10"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                'Sending...'
                            ) : (
                                <>
                                    <span>Send OTP</span>
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        By continuing, you agree to our Terms & Privacy Policy
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
